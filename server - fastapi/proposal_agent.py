from pathlib import Path
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


class CoverLetterAgent:
    def __init__(self, llm=None, data_file="jobs_dataset.json"):
        self.data_file = Path(data_file)

        if not self.data_file.exists():
            raise FileNotFoundError(f"Missing dataset: {self.data_file}")

        with open(self.data_file, "r", encoding="utf-8") as f:
            self.jobs = json.load(f)

        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest", temperature=0.7
        )

        self.cover_letter_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an AI assistant that writes professional, tailored cover letters 
                    for students applying to jobs on the platform SkillVerse.

                    Your output must:
                    - Start with a personalized greeting (use client name and/or company if available, otherwise "Hiring Manager")
                    - Be structured like a real cover letter (greeting, intro, body paragraphs, closing)
                    - Be concise (3–5 paragraphs max)  
                    - Use a professional but approachable tone  
                    - Highlight how the student’s skills and background align with the job description
                    - End with a polite closing and the candidate’s name/signature  
                    - Avoid generic filler text — keep it specific to the role, skills, and client/company.""",
                ),
                (
                    "human",
                    """Job Information:
                    - Title: {job_title}
                    - Description: {description}
                    - Client Name: {client_name}
                    - Company: {client_company}

                    Candidate Information:
                    - Name: {name}
                    - Email: {email}
                    - Skills: {skills}

                    Write a tailored, professional cover letter for this candidate applying to the job.
                    """,
                ),
            ]
        )

        self.chain = self.cover_letter_prompt | self.llm | StrOutputParser()

    def generate_cover_letter(
        self,
        name: str,
        email: str,
        skills: list[str],
        job_title: str,
        description: str,
        client_name: str = "",
        client_company: str = "",
    ):
        """Generate a customized cover letter for a job application."""

        cover_letter = self.chain.invoke(
            {
                "job_title": job_title,
                "description": description,
                "client_name": client_name or "Hiring Manager",
                "client_company": client_company or "the company",
                "name": name,
                "email": email,
                "skills": ", ".join(skills),
            }
        )

        return {"cover_letter": cover_letter}
