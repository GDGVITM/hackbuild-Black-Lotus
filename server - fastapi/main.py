from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from chatbot import get_response, convert_history, ChatRequest
from job_agent import JobRecommenderAgent
from proposal_agent import ProposalAgent
from rate_benchmark_agent import RateBenchmarkAgent
from langchain_google_genai import ChatGoogleGenerativeAI

app = FastAPI()

origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)
job_agent = JobRecommenderAgent(llm=llm, data_file="jobs_dataset.json")
proposal_agent = ProposalAgent(llm=llm, data_file="jobs_dataset.json")
rate_agent = RateBenchmarkAgent(llm=llm)


@app.get("/")
async def root():
    """A simple endpoint to confirm the server is running."""
    return {"status": "running"}


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_msg = req.message.strip()
    hist_msgs = convert_history(req.history)
    reply = await get_response(user_msg, hist_msgs)
    return {"data": {"reply": reply}}


@app.post("/recommend")
async def recommend_endpoint(data: dict = Body(...)):
    # updateJSON();
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = job_agent.recommend(query)
    return {"data": reply}


@app.post("/generate-proposal")
async def generate_proposal(data: dict = Body(...)):
    job_title = data.get("job_title", "").strip()
    skills = data.get("user_skills", "").strip()

    if not job_title or not skills:
        return {"error": "Both job_title and user_skills are required"}

    reply = proposal_agent.generate_proposal(job_title, skills)
    return reply


@app.post("/benchmark")
async def benchmark_endpoint(data: dict = Body(...)):
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = rate_agent.benchmark(query)
    return {"data": reply}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
