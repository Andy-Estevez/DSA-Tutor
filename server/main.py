import os
import asyncpg
from contextlib import asynccontextmanager
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Set up the database pool variable
db_pool = None

# This runs when Uvicorn starts and stops
@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    db_pool = await asyncpg.create_pool(os.getenv("DATABASE_URL"))
    yield
    await db_pool.close()

# Pass the lifespan into the FastAPI app
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/")
async def root():
    return {"message": "API is online and ready for routes."}

@app.post("/api/chat")
async def chat_endpoint(payload: dict = Body(...)):
    user_message = payload.get("message", "")
    history = payload.get("history", [])
    
    # 1. Log User Message to Supabase via asyncpg
    async with db_pool.acquire() as connection:
        await connection.execute(
            "INSERT INTO messages (role, content) VALUES ($1, $2)",
            "user", user_message
        )
    
    # 2. Format history & prompt
    transcript = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history])
    full_prompt = f"Conversation History:\n{transcript}\n\nUser: {user_message}"
    
    # 3. Query Gemini
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=full_prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are an expert Data Structures and Algorithms tutor. "
                "Your goal is to guide the user using the Socratic method. "
                "Avoiding outputting direct code solutions. Ask probing questions "
                "to help them arrive at the answer themselves. Only provide direct "
                "code if it doesn't spoil anything to the user. "
                "Output plain text only. Do not use markdown or rich text formatting."
            ),
            temperature=0.7,
        )
    )
    
    tutor_content = response.text
    
    # 4. Log Tutor Response to Supabase via asyncpg
    async with db_pool.acquire() as connection:
        await connection.execute(
            "INSERT INTO messages (role, content) VALUES ($1, $2)",
            "tutor", tutor_content
        )
    
    # 5. Return to React
    return {
        "role": "tutor",
        "content": tutor_content
    }

@app.get("/api/chat")
async def get_chat_history():
    async with db_pool.acquire() as connection:
        # Fetch all messages ordered by ID so the conversation flows correctly
        rows = await connection.fetch(
            "SELECT role, content FROM messages ORDER BY id ASC"
        )
        
        # Convert the asyncpg Record objects into standard Python dictionaries
        return [{"role": row["role"], "content": row["content"]} for row in rows]