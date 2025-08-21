from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.runnables import RunnableParallel, RunnableLambda, RunnablePassthrough

import os

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS config (change origin if needed)
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic input model
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []  # Each item: { from: "user" | "bot", text: str }

# 1. Load and process documents
data_dir = Path("./")
file_paths = [
    data_dir / "student_guide.txt",
    data_dir / "business_guide.txt",
    data_dir / "faq.txt"
]

docs = []
for file_path in file_paths:
    if file_path.exists():
        loader = TextLoader(file_path)
        docs.extend(loader.load())
    else:
        raise FileNotFoundError(f"Missing file: {file_path}")

splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# 2. Vector store setup
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_store = Chroma.from_documents(chunks, embedding)
retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})

# 3. Gemini model
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)
parser = StrOutputParser()

# 4. Format documents
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# 5. Prompt with message placeholders
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content="""
You are an expert and helpful AI assistant for the 'WorkHive' freelance marketplace.

Answer the user's questions based ONLY on the context documents. If the answer isn’t found in the documents, respond with:
"I'm not sure about that. Please reach out to a human agent or check the official documentation."

Do not fabricate answers.
"""),
    MessagesPlaceholder(variable_name="history"),
    HumanMessage(content="Context:\n{documents}\n\nNow answer this:\n{question}")
])

# 6. RAG chain with history
chain = (
    RunnableParallel(
        documents=retriever | RunnableLambda(format_docs),
        question=RunnablePassthrough()
    )
    | chat_prompt
    | model
    | parser
)

# 7. Convert frontend history to LangChain message objects
def convert_history_to_messages(history: List[Dict[str, str]]):
    messages = []
    for item in history:
        role = item.get("from")
        text = item.get("text", "")
        if role == "user":
            messages.append(HumanMessage(content=text))
        elif role == "bot":
            messages.append(AIMessage(content=text))
    return messages

# 8. FastAPI endpoint
@app.post("/chat")
# async def chat_endpoint(request: ChatRequest):
#     try:
#         user_message = request.message.strip()
#         history_msgs = convert_history_to_messages(request.history)

#         result = chain.invoke({
#             "question": user_message,
#             "history": history_msgs
#         })

#         return {"data": {"reply": result}}

#     except Exception as e:
#         return {"error": str(e)}
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_message = request.message.strip()
        history_msgs = convert_history_to_messages(request.history)

        print("📩 Incoming message:", user_message)
        print("🕑 History:", history_msgs)

        result = chain.invoke({
            "question": user_message,
            "history": history_msgs
        })

        print("🤖 Gemini reply:", result)

        return {"data": {"reply": result}}

    except Exception as e:
        print("❌ Backend error:", e)
        return {"error": str(e)}
