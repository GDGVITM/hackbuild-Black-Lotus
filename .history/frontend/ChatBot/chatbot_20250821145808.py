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
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

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

# --- Docs ---
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

splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# --- Vectorstore ---
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_store = Chroma.from_documents(chunks, embedding)
retriever = vector_store.as_retriever(search_kwargs={"k": 4})

# --- Model ---
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)

# --- Prompt ---
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
You are an expert and helpful AI assistant for the 'WorkHive' freelance marketplace.

Answer ONLY from the context below.  
If unsure, say: "I'm not sure about that. Please reach out to a human agent or check the official documentation."
"""),
    MessagesPlaceholder(variable_name="history"),
    HumanMessage(content="Context:\n{context}\n\nNow answer:\n{question}")
])

# --- Helper: format docs ---
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# --- Build chain manually (avoid dict leaks) ---
def rag_chain(question, history):
    docs = retriever.invoke(question)
    context = format_docs(docs)
    prompt = chat_prompt.invoke({"context": context, "question": question, "history": history})
    result = llm.invoke(prompt)

    # Always return plain string
    if isinstance(result, AIMessage):
        return result.content
    return str(result)

# --- History conversion ---
def convert_history(history: List[Dict[str, str]]):
    msgs = []
    for h in history:
        if h["from"] == "user":
            msgs.append(HumanMessage(content=h["text"]))
        elif h["from"] == "bot":
            msgs.append(AIMessage(content=h["text"]))
    return msgs

# --- Endpoint ---
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        user_msg = req.message.strip()
        hist_msgs = convert_history(req.history)

        print("📩 User:", user_msg)
        reply = rag_chain(user_msg, hist_msgs)
        print("🤖 Reply:", reply)

        return {"data": {"reply": reply}}

    except Exception as e:
        print("❌ Backend error:", e)
        return {"error": str(e)}
