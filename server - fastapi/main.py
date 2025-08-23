from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

from chatbot import get_response, convert_history, ChatRequest
from job_agent import JobRecommenderAgent
from proposal_agent import CoverLetterAgent
from mcq_agent import McqAgent
from user_recommender_agent import UserRecommenderAgent
from rate_benchmark_agent import RateBenchmarkAgent

load_dotenv()

app = FastAPI()

# ---------- CORS ----------
origins = ["http://localhost:3000", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LLM + Agents ----------
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.2)

job_agent = JobRecommenderAgent(llm=llm, data_file="jobs_dataset.json")
proposal_agent = CoverLetterAgent(llm=llm, data_file="jobs_dataset.json")
rate_agent = RateBenchmarkAgent(llm=llm)
mcq_agent = McqAgent(llm=llm)
user_agent = UserRecommenderAgent(llm=llm, data_file="users_dataset.json")


# ---------- Endpoints ----------
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_msg = req.message.strip()
    hist_msgs = convert_history(req.history)
    reply = await get_response(user_msg, hist_msgs)
    if not isinstance(reply, str):
        reply = str(reply)
    return JSONResponse(content={"reply": reply})


# ----- Jobs -----
@app.post("/recommend")
async def recommend_endpoint(data: dict = Body(...)):
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = job_agent.recommend(query)
    return {"jobs": reply.get("jobs", [])}


from fastapi import FastAPI, Body


@app.post("/generate-proposal")
async def generate_proposal(data: dict = Body(...)):
    job_title = data.get("job_title", "").strip()
    skills = data.get("skills", [])
    name = data.get("name", "")
    email = data.get("email", "")
    description = data.get("description", "")
    client_name = data.get("client_name", "")
    client_company = data.get("client_company", "")

    if not job_title or not skills:
        return {"error": "job_title and skills are required"}

    # You can modify your proposal_agent to accept all these details if needed
    reply = proposal_agent.generate_cover_letter(
        job_title, skills, name, email, description, client_name, client_company
    )
    return {"cover_letter": reply}


@app.post("/benchmark")
async def benchmark_endpoint(data: dict = Body(...)):
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = rate_agent.benchmark(query)
    return {"data": reply}  # 👈 instead of reply.get("benchmarks", [])


# ----- Stage 1: MCQs -----
@app.post("/generate-mcqs")
async def generate_mcqs(data: dict = Body(...)):
    skills = data.get("skills", [])
    if not skills:
        return {"error": "Skills are required"}
    mcqs = mcq_agent.generate_mcqs(skills)
    return {"questions": mcqs}


@app.post("/evaluate-mcqs")
async def evaluate_mcqs(data: dict = Body(...)):
    questions = data.get("questions", [])
    user_answers = data.get("user_answers", {})

    if not questions or user_answers is None:
        return {"evaluation": {"score": 0, "details": [], "feedback": "Invalid input"}}

    evaluation = mcq_agent.evaluate_mcqs(questions, user_answers)

    # Normalize to compute simple score
    results = []
    correct_count = 0

    if isinstance(evaluation, list):
        for item in evaluation:
            q = item.get("question", "")
            ua = item.get("user_answer", "")
            ca = item.get("correct_answer", "")
            correct = item.get("is_correct", False)
            fb = item.get("feedback", "")
            if correct:
                correct_count += 1
            results.append(
                {
                    "question": q,
                    "user_answer": ua,
                    "correct_answer": ca,
                    "is_correct": correct,
                    "feedback": fb,
                }
            )
    else:
        return {
            "evaluation": {
                "score": 0,
                "details": [],
                "feedback": "Failed to parse evaluation",
            }
        }

    score = correct_count if questions else 0
    # No gate here—frontend will always show Stage 2 button
    return {"evaluation": {"score": score, "details": results}}


# ----- Stage 2: Descriptive/Text -----
@app.post("/generate-descriptive")
async def generate_descriptive(data: dict = Body(...)):
    skills = data.get("skills", [])
    if not skills:
        return {"error": "Skills are required"}
    qs = mcq_agent.generate_descriptive(skills)
    return {"questions": qs}


@app.post("/evaluate-descriptive")
async def evaluate_descriptive(data: dict = Body(...)):
    questions = data.get("questions", [])
    user_answers = data.get("user_answers", {})
    if not questions or user_answers is None:
        return {
            "evaluation": {"total_score": 0, "details": [], "feedback": "Invalid input"}
        }

    result = mcq_agent.evaluate_descriptive(questions, user_answers)

    # Normalize if model returns list + final object
    details = []
    total = 0
    if isinstance(result, list):
        for item in result:
            if isinstance(item, dict) and "total_score" in item:
                total = item.get("total_score", total)
            else:
                details.append(
                    {
                        "question": item.get("question", ""),
                        "user_answer": item.get("user_answer", ""),
                        "score": item.get("score", 0),
                        "feedback": item.get("feedback", ""),
                    }
                )
        if not total:
            total = sum(d.get("score", 0) for d in details)
    elif isinstance(result, dict):
        total = result.get("total_score", 0)
        details = result.get("details", [])
    else:
        return {
            "evaluation": {
                "total_score": 0,
                "details": [],
                "feedback": "Failed to parse evaluation",
            }
        }

    return {"evaluation": {"total_score": total, "details": details}}


# ----- Users -----
@app.post("/recommend-users")
async def recommend_users(data: dict = Body(...)):
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = user_agent.recommend(query)
    return {"users": reply.get("users", [])}


# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
