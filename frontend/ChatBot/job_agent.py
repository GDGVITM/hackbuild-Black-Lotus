from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
import os


class JobRecommenderAgent:
    def __init__(self, llm=None, data_dir="./"):
        self.data_dir = Path(data_dir)

        # Files used for job recommendations
        self.file_paths = [
            self.data_dir / "student_guide.txt",
            self.data_dir / "business_guide.txt",
            self.data_dir / "faq.txt",
        ]

        # Load docs
        docs = []
        for f in self.file_paths:
            if f.exists():
                docs.extend(TextLoader(f).load())
            else:
                raise FileNotFoundError(f"Missing file: {f}")

        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
        chunks = splitter.split_documents(docs)

        # Vector DB
        embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.vector_store = Chroma.from_documents(chunks, embedding)
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})

        # LLM
        self.llm = llm or ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)

        # Prompt
        self.job_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an AI career advisor for the 'WorkHive' student freelance marketplace.
Use the provided context to:
- Recommend suitable freelance jobs based on the user's skills, profile, or business needs
- Suggest categories, roles, and workflow steps
- Reference platform features like proposals, contracts, escrow, compliance, and collaboration
Be specific, structured, and professional, but also friendly and supportive."""),
            ("human", "Context:\n{context}\n\nUser profile/query: {query}")
        ])

        self.chain = self.job_prompt | self.llm | StrOutputParser()

    def format_docs(self, docs):
        lines = []
        for d in docs:
            if hasattr(d, "page_content"):
                lines.append(d.page_content)
            elif isinstance(d, dict) and "page_content" in d:
                lines.append(d["page_content"])
            else:
                lines.append(str(d))
        return "\n\n".join(lines)

    def recommend(self, query: str):
        # Retrieve relevant docs
        relevant_docs = self.retriever.invoke(query)
        context = self.format_docs(relevant_docs)

        if not context or len(context.strip()) < 50:
            return "I couldn’t find enough info in the guides. Please try giving me more details about your skills or career goals."

        return self.chain.invoke({"query": query, "context": context})
