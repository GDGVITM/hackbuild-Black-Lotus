from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

import os

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS config
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

# --- Load documents ---
data_dir = Path("./")
file_paths = [
    data_dir / "student_guide.txt",
    data_dir / "business_guide.txt",
    data_dir / "faq.txt"
]

docs = []
for f in file_paths:
    if f.exists():
        docs.extend(TextLoader(f).load())
    else:
        raise FileNotFoundError(f"Missing file: {f}")

splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# --- Vectorstore ---
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_store = Chroma.from_documents(chunks, embedding)
retriever = vector_store.as_retriever(search_kwargs={"k": 4})

# --- Model ---
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)

# --- Enhanced Prompts ---
# RAG prompt for when context is available
rag_prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
You are an expert and helpful AI assistant for the 'WorkHive' freelance marketplace.

Use the provided context to answer the user's question. If the context doesn't contain enough information to fully answer the question, say so and suggest they contact support or check the official documentation.

Be helpful, friendly, and professional in your responses.
"""),
    MessagesPlaceholder(variable_name="history"),
    HumanMessage(content="Context:\n{context}\n\nUser question: {question}")
])

# Fallback prompt for general conversation
fallback_prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
You are a helpful AI assistant for the 'WorkHive' freelance marketplace.

You should be friendly and professional. For basic greetings, respond warmly and ask how you can help with WorkHive-related questions.

For questions you can't answer specifically about WorkHive features, politely explain that you'd need more specific information from our documentation or suggest they contact support.

Keep responses concise and helpful.
"""),
    MessagesPlaceholder(variable_name="history"),
    HumanMessage(content="{question}")
])

# --- Helper functions ---
def format_docs(docs):
    lines = []
    for d in docs:
        if hasattr(d, "page_content"):
            lines.append(d.page_content)
        elif isinstance(d, dict) and "page_content" in d:
            lines.append(d["page_content"])
        else:
            lines.append(str(d))
    return "\n\n".join(lines)

def convert_history(history: List[Dict[str, str]]):
    msgs = []
    for h in history:
        if h["from"] == "user":
            msgs.append(HumanMessage(content=h["text"]))
        elif h["from"] == "bot":
            msgs.append(AIMessage(content=h["text"]))
    return msgs

def is_greeting_or_general(message: str) -> bool:
    """Check if message is a greeting or very general query"""
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    general_queries = ["help", "what can you do", "how are you"]
    
    msg_lower = message.lower().strip()
    return (
        any(greeting in msg_lower for greeting in greetings) or
        any(query in msg_lower for query in general_queries) or
        len(msg_lower.split()) <= 2  # Very short queries
    )

# --- Build chains ---
rag_chain = (
    RunnablePassthrough.assign(
        context=(lambda x: format_docs(retriever.invoke(x["question"])))
    )
    | rag_prompt
    | llm
    | StrOutputParser()
)

fallback_chain = fallback_prompt | llm | StrOutputParser()

# --- Smart routing function ---
async def get_response(question: str, history: List):
    """Route to appropriate chain based on query type and context availability"""
    
    # For greetings and very general queries, use fallback
    if is_greeting_or_general(question):
        return fallback_chain.invoke({"question": question, "history": history})
    
    # Try RAG first
    try:
        # Retrieve relevant documents
        relevant_docs = retriever.invoke(question)
        context = format_docs(relevant_docs)
        
        # If we have substantial context, use RAG
        if context and len(context.strip()) > 50:  # Threshold for meaningful context
            print(f"📄 Using RAG with context length: {len(context)}")
            return rag_chain.invoke({"question": question, "history": history})
        else:
            # No good context found, use fallback
            print("⚡ No relevant context found, using fallback")
            return fallback_chain.invoke({"question": question, "history": history})
            
    except Exception as e:
        print(f"❌ RAG chain error: {e}, falling back to general response")
        return fallback_chain.invoke({"question": question, "history": history})

# --- Endpoint ---
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        user_msg = req.message.strip()
        hist_msgs = convert_history(req.history)

        print("📩 User:", user_msg)
        
        reply = await get_response(user_msg, hist_msgs)
        
        print("🤖 Reply:", reply)

        return {"data": {"reply": reply}}

    except Exception as e:
        print("❌ Backend error:", e)
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)