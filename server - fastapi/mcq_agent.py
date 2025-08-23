import json
import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain_core.output_parsers import StrOutputParser

load_dotenv()


class McqAgent:
    def __init__(self, llm=None):
        # You can pass an LLM from main.py; otherwise we create a default one
        self.llm = llm or ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", temperature=0.7
        )
        parser = StrOutputParser()

        # -------- Stage 1 (MCQs) --------
        self.mcq_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are an AI Interview Coach. 
Generate **exactly 10 multiple choice questions (MCQs)** based on the provided skills.

Rules:
- Each question must test a different concept (avoid overlap).
- Difficulty roadmap:
  * Q1–3: beginner (syntax, basics, definitions)
  * Q4–6: intermediate (logic, small coding/debugging)
  * Q7–8: advanced (optimizations, tricky edge cases, algorithms)
  * Q9–10: expert (performance, scalability, deeper design reasoning)
- At least 6 questions must require **code analysis or predicting output**.
- Randomize question style slightly using the random variant ID: {variant}.
- Output must be **valid JSON only**.

Format:
[
  {
    "question": "string (can contain code blocks)",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_option": "A"
  }
]
"""
                ),
                ("human", "User skills: {skills}"),
            ]
        )
        self.mcq_chain = self.mcq_prompt | self.llm | parser

        self.eval_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are an AI evaluator. 
Compare the user's selected options with the correct options.
Return **valid JSON** list:

[
  {
    "question": "string",
    "user_answer": "A/B/C/D",
    "correct_answer": "A/B/C/D",
    "is_correct": true/false,
    "feedback": "short explanation"
  }
]"""
                ),
                ("human", "Questions: {qa_pairs}\n\nUser Answers: {user_answers}"),
            ]
        )
        self.eval_chain = self.eval_prompt | self.llm | parser

        # -------- Stage 2 (Text / Coding) --------
        self.desc_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are an AI Interview Coach. 
Generate **3 descriptive/coding questions** (NO MCQs) based on the provided skills.

Rules:
- Each question requires a free-text or code answer.
- Difficulty mix:
  * Q1: intermediate practical coding task
  * Q2: advanced problem (edge cases, time/space trade-offs)
  * Q3: expert/design question (architecture, scalability, testing)
- Keep prompts concise but unambiguous.
- Output **valid JSON only**:

[
  {"question": "string (may include code snippets and inputs/outputs)"},
  {"question": "string"},
  {"question": "string"}
]
"""
                ),
                ("human", "User skills: {skills}"),
            ]
        )
        self.desc_chain = self.desc_prompt | self.llm | parser

        self.desc_eval_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="""You are a strict but fair coding evaluator.
Evaluate user **descriptive/coding answers** for correctness, clarity, edge cases, and complexity.
BE STRICTER WITH THEM **JUDGING SHOULD BE TOUGH**                          

Return **valid JSON** list of per-question results:
[
  {
    "question": "string",
    "user_answer": "string",
    "score": 0-10,
    "feedback": "short, constructive feedback"
  }
]

Then ALSO include a final object:
{"total_score": number}  # sum of the 3 scores, max 30
"""
                ),
                ("human", "Questions: {questions}\n\nUser Answers: {user_answers}"),
            ]
        )
        self.desc_eval_chain = self.desc_eval_prompt | self.llm | parser

    # -------- Stage 1 --------
    def generate_mcqs(self, skills: list[str], variant_id: int = None):
        raw = self.mcq_chain.invoke(
            {
                "skills": ", ".join(skills),
                "variant": str(variant_id or os.urandom(2).hex()),
            }
        )
        return self._parse_json(raw)

    def evaluate_mcqs(self, questions: list[dict], user_answers: dict):
        raw = self.eval_chain.invoke(
            {
                "qa_pairs": json.dumps(questions, indent=2),
                "user_answers": json.dumps(user_answers, indent=2),
            }
        )
        return self._parse_json(raw)

    # -------- Stage 2 --------
    def generate_descriptive(self, skills: list[str]):
        raw = self.desc_chain.invoke({"skills": ", ".join(skills)})
        return self._parse_json(raw)

    def evaluate_descriptive(self, questions: list[dict], user_answers: dict):
        raw = self.desc_eval_chain.invoke(
            {
                "questions": json.dumps(questions, indent=2),
                "user_answers": json.dumps(user_answers, indent=2),
            }
        )
        return self._parse_json(raw)

    # -------- Helper --------
    def _parse_json(self, raw_reply: str):
        try:
            text = raw_reply.strip()
            if text.startswith("```"):
                text = text.strip("`")
                if text.lower().startswith("json"):
                    text = text[4:]
                text = text.strip()
            return json.loads(text)
        except Exception:
            return {"error": "Failed to parse", "raw": raw_reply}
