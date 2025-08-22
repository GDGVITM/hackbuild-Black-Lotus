from pathlib import Path
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class ProposalAgent:
    def __init__(self, llm=None, data_file="jobs_dataset.json"):
        self.data_file = Path(data_file)

        if not self.data_file.exists():
            raise FileNotFoundError(f"Missing dataset: {self.data_file}")

        with open(self.data_file, "r", encoding="utf-8") as f:
            self.jobs = json.load(f)

        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", temperature=0.7
        )

        self.proposal_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an AI freelance assistant that writes tailored proposals 
                            for student freelancers applying to jobs.  

                            Your output must:
                            - Be written in a professional but friendly tone  
                            - Highlight how the student’s skills match the job  
                            - Be concise (3–5 paragraphs max)  
                            - Include a short greeting and a polite closing  
                            - Avoid generic filler text. Make it specific to the job and skills.""",
                ),
                (
                    "human",
                    "Job details:\n{job}\n\nUser skills:\n{skills}\n\nWrite the proposal.",
                ),
            ]
        )

        self.chain = self.proposal_prompt | self.llm | StrOutputParser()

    def generate_proposal(self, job_title: str, user_skills: str):
        job = next((j for j in self.jobs if j["title"] == job_title), None)
        if not job:
            return {"error": f"Job '{job_title}' not found in dataset."}

        job_context = json.dumps(job, indent=2)

        proposal = self.chain.invoke({"job": job_context, "skills": user_skills})
        return {"proposal": proposal}
