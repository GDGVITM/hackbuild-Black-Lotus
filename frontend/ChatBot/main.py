from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from chatbot import get_response, convert_history, ChatRequest
from job_agent import JobRecommenderAgent
from langchain_google_genai import ChatGoogleGenerativeAI

# -------------------------
# Init FastAPI
# -------------------------
app = FastAPI()

# CORS: Allow multiple origins for development
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Add this if you have another dev server
    "http://localhost:8000" # Allow the server to access itself
]
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

# Fix: Changed 'data_file' to 'data_dir' to match the constructor
job_agent = JobRecommenderAgent(llm=llm, data_dir="jobs_dataset.json")

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
    # Make sure to run on the correct host and port
    uvicorn.run(app, host="0.0.0.0", port=8000)
