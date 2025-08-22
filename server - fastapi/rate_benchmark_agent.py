from pathlib import Path
import json
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import StrOutputParser


class RateBenchmarkAgent:
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
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 6})

        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", temperature=0.2
        )

        self.rate_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are a freelance market analyst for 'WorkHive'.
                                Using the provided dataset context, analyze job postings and benchmark freelance rates.
                                Return only valid JSON in this structure:
                                {
                                "searched_role": "string",
                                "avg_rate": number,
                                "median_rate": number,
                                "min_rate": number,
                                "max_rate": number,
                                "p10_rate": number,
                                "p90_rate": number,
                                "suggested_range": {
                                    "floor": number,
                                    "ceiling": number,
                                    "point": number
                                },
                                "recommendation": "string"
                                }

                                Rules:
                                - Extract rates (budgets/hour) from dataset context
                                - Compute descriptive stats (mean, median, min, max, approx percentiles)
                                - Suggest a fair range for freelancers
                                - Keep recommendation short, actionable
                                - Do NOT return text outside JSON
                                """
                ),
                ("human", "Context:\n{context}\n\nUser query: {query}"),
            ]
        )

        self.chain = self.rate_prompt | self.llm | StrOutputParser()

    def format_docs(self, docs):
        return "\n\n".join(d.page_content for d in docs)

    def benchmark(self, query: str):
        relevant_docs = self.retriever.invoke(query)
        context = self.format_docs(relevant_docs)

        if not context or len(context.strip()) < 50:
            return {
                "searched_role": query,
                "avg_rate": 0,
                "median_rate": 0,
                "min_rate": 0,
                "max_rate": 0,
                "p10_rate": 0,
                "p90_rate": 0,
                "suggested_range": {"floor": 0, "ceiling": 0, "point": 0},
                "recommendation": "Not enough data to benchmark rates. Try a more specific role.",
            }

        raw_reply = self.chain.invoke({"query": query, "context": context})

        try:
            if raw_reply.strip().startswith("```"):
                raw_reply = raw_reply.strip().strip("`").replace("json", "", 1).strip()

            result = json.loads(raw_reply)

            safe_result = {
                "searched_role": result.get("searched_role", query),
                "avg_rate": result.get("avg_rate", 0),
                "median_rate": result.get("median_rate", 0),
                "min_rate": result.get("min_rate", 0),
                "max_rate": result.get("max_rate", 0),
                "p10_rate": result.get("p10_rate", 0),
                "p90_rate": result.get("p90_rate", 0),
                "suggested_range": {
                    "floor": result.get("suggested_range", {}).get("floor", 0),
                    "ceiling": result.get("suggested_range", {}).get("ceiling", 0),
                    "point": result.get("suggested_range", {}).get("point", 0),
                },
                "recommendation": result.get(
                    "recommendation", "No recommendation generated."
                ),
            }

            return safe_result

        except Exception:
            return {
                "searched_role": query,
                "avg_rate": 0,
                "median_rate": 0,
                "min_rate": 0,
                "max_rate": 0,
                "p10_rate": 0,
                "p90_rate": 0,
                "suggested_range": {"floor": 0, "ceiling": 0, "point": 0},
                "recommendation": "Failed to generate benchmark. Please try again.",
            }
