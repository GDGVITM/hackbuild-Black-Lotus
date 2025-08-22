from pathlib import Path
import json
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
import os


class JobRecommenderAgent:
    def __init__(self, llm=None, data_file="jobs_dataset.json"):
        self.data_file = Path(data_file)

        if not self.data_file.exists():
            raise FileNotFoundError(f"Missing dataset: {self.data_file}")

        with open(self.data_file, "r", encoding="utf-8") as f:
            dataset_text = f.read()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.create_documents([dataset_text])

        embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.vector_store = Chroma.from_documents(chunks, embedding)
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})

        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", temperature=0.2
        )

        self.job_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are an AI career advisor for the 'WorkHive' student freelance marketplace.
                                You must ONLY return results in valid JSON format with this structure:
                                [
                                {
                                    "title": "string",
                                    "company": "string",
                                    "rate": "string",
                                    "skills_required": ["string", "string"],
                                    "description": "string",
                                    "link": "string"
                                }
                                ]

                                Rules:
                                - Do NOT include extra text, only valid JSON
                                - Select 3–5 relevant jobs based on the query
                                - Use the provided dataset context
                                """
                ),
                ("human", "Context:\n{context}\n\nUser profile/query: {query}"),
            ]
        )

        self.chain = self.job_prompt | self.llm | StrOutputParser()

    def format_docs(self, docs):
        return "\n\n".join(d.page_content for d in docs)

    def recommend(self, query: str):
        relevant_docs = self.retriever.invoke(query)
        context = self.format_docs(relevant_docs)

        if not context or len(context.strip()) < 50:
            return {
                "error": "I couldn’t find enough info in the guides. Please give me more details about your skills or career goals."
            }

        raw_reply = self.chain.invoke({"query": query, "context": context})

        try:
            if raw_reply.strip().startswith("```"):
                raw_reply = raw_reply.strip().strip("`").replace("json", "", 1).strip()

            jobs = json.loads(raw_reply)
            return {"jobs": jobs}
        except Exception:
            return {"text": raw_reply}
