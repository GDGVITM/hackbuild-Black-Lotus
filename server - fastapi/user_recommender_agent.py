from pathlib import Path
import json
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import StrOutputParser


class UserRecommenderAgent:
    def __init__(self, llm=None, data_file="users_dataset.json"):
        self.data_file = Path(data_file)

        if not self.data_file.exists():
            raise FileNotFoundError(f"Missing dataset: {self.data_file}")

        # Load dataset
        with open(self.data_file, "r", encoding="utf-8") as f:
            dataset_text = f.read()

        # Split into chunks for embedding
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.create_documents([dataset_text])

        # Embedding + Vector DB
        embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.vector_store = Chroma.from_documents(chunks, embedding)
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 6})

        # LLM
        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", temperature=0.2
        )

        # Prompt
        self.user_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are an AI recruiter for the 'WorkHive' platform.  
                    You must ONLY return valid JSON with this structure:
                    [
                        {
                            "fullname": "string",
                            "email": "string",
                            "headline": "string",
                            "skills": ["string", "string"],
                            "hourlyRate": number,
                            "stars": number,
                            "portfolioLinks": {
                                "github": "string",
                                "linkedin": "string",
                                "website": "string"
                            }
                        }
                    ]

                    Rules:
                    - Select the 3–5 most relevant users for the job.
                    - Priority: (1) Skill match → (2) Stars → (3) Hourly rate proximity.
                    - Do NOT add extra text, only return valid JSON.
                    """
                ),
                (
                    "human",
                    "Context:\n{context}\n\nJob description/query: {query}",
                ),
            ]
        )

        self.chain = self.user_prompt | self.llm | StrOutputParser()

    def format_docs(self, docs):
        return "\n\n".join(d.page_content for d in docs)

    def recommend(self, job_query: str):
        # Retrieve most relevant user docs
        relevant_docs = self.retriever.invoke(job_query)
        context = self.format_docs(relevant_docs)

        if not context or len(context.strip()) < 50:
            return {
                "error": "Not enough user data found. Please provide a more detailed job description."
            }

        raw_reply = self.chain.invoke({"query": job_query, "context": context})

        try:
            if raw_reply.strip().startswith("```"):
                raw_reply = raw_reply.strip().strip("`").replace("json", "", 1).strip()

            users = json.loads(raw_reply)
            return {"users": users}
        except Exception:
            return {"text": raw_reply}
