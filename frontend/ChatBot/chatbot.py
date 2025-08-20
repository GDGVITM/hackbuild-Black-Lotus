import os
from pathlib import Path
from dotenv import load_dotenv

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough

# Load environment variables from .env file
load_dotenv()

# --- 1. Data Loading and Preprocessing ---
print("Loading and processing documents...")

# Create a list of file paths to load
data_dir = Path("./")
file_paths = [
    data_dir / "student_guide.txt",
    data_dir / "business_guide.txt",
    data_dir / "faq.txt"
]

# Load all text files into a single list of documents
docs = []
for file_path in file_paths:
    if file_path.exists():
        loader = TextLoader(file_path)
        docs.extend(loader.load())
    else:
        print(f"Error: File not found at {file_path}")
        exit()

# Split the documents into smaller, manageable chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=200
)
chunks = splitter.split_documents(docs)

# --- 2. Vector Store Creation ---
print("Creating vector store...")

# Initialize the embedding model
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Create a Chroma vector store from the document chunks
vector_store = Chroma.from_documents(chunks, embedding)

# --- 3. RAG Chain Setup ---
print("Setting up the RAG chain...")

# Define the retriever to fetch relevant document chunks
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}
)

# Initialize the generative AI model for chat responses
model = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest",
    temperature=0.2
)

# Define the output parser
parser = StrOutputParser()

# Define the prompt template for the chatbot
prompt = PromptTemplate(
    template="""
    You are an expert and a helpful AI assistant for the 'WorkHive' freelance marketplace.
    Your job is to answer questions about the platform's features, policies, and functionality.

    Answer ONLY based on the provided documents. If the question cannot be answered from the
    documents, politely state that you cannot answer but do not mention that u don't have it on the documents and suggest they contact a human agent or check the platform's official documentation. Do not invent information.

    Here are the documents to base your answer on:
    {documents}

    Here is the question from the user:
    {question}

    """,
    input_variables=['documents', 'question']
)

# Helper function to format the retrieved documents
def format_docs(retrieved_docs):
    context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
    return context_text

# Create the RAG chain
chain = (
    RunnableParallel(
        # The retriever gets relevant documents based on the user's question
        documents=retriever | RunnableLambda(format_docs),
        # The user's question is passed through to the prompt
        question=RunnablePassthrough()
    )
    | prompt  # The prompt formats the documents and question for the model
    | model   # The Gemini model generates a response
    | parser  # The output parser converts the response to a string
)

# --- 4. Interactive Chat Loop ---
print("Chatbot is ready. Type 'quit' or 'exit' to end the session.")
print("---")

while True:
    user_question = input("You: ")
    if user_question.lower() in ['quit', 'exit']:
        print("Goodbye!")
        break
    
    # Invoke the chain with the user's question
    try:
        response = chain.invoke(user_question)
        print(f"Bot: {response}")
        print("---")
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please try again or restart the program.")