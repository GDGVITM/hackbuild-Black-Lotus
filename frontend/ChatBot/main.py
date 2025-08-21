from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from chatbot import get_response, convert_history, ChatRequest
from job_agent import JobRecommenderAgent
from langchain_google_genai import ChatGoogleGenerativeAI

# -------------------------
# Init FastAPI
# -------------------------
app = FastAPI()

# CORS
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Init Agents
# -------------------------
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.2)

# Job recommender with dataset
job_agent = JobRecommenderAgent(llm=llm, data_file="jobs_dataset.json")

# -------------------------
# Routes
# -------------------------

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    General chatbot endpoint
    """
    user_msg = req.message.strip()
    hist_msgs = convert_history(req.history)
    reply = await get_response(user_msg, hist_msgs)
    return {"data": {"reply": reply}}


@app.post("/recommend")
async def recommend_endpoint(data: dict = Body(...)):
    query = data.get("query", "").strip()
    if not query:
        return {"error": "Query is required"}
    reply = job_agent.recommend(query)
    return {"data": reply}


# -------------------------
# Run app
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
