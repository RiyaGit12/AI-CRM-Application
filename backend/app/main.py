from fastapi import FastAPI
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph
from typing import TypedDict
from dotenv import load_dotenv
from datetime import date
from sqlalchemy import create_engine, Column, String, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import json
import re

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")

# ---------------- DATABASE SETUP ---------------- #

DATABASE_URL = "sqlite:///./crm.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class InteractionModel(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    hcp_name = Column(String, index=True)
    interaction_type = Column(String)
    date_time = Column(String)
    notes = Column(Text)
    outcome = Column(String)
    follow_up = Column(Text)

Base.metadata.create_all(bind=engine)

# ---------------- LLM SETUP ---------------- #

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.3-70b-versatile",
    temperature=0
)

# ---------------- TOOLS ---------------- #

def log_interaction_tool(input_text: str) -> dict:
    today = date.today().strftime("%Y-%m-%d")
    prompt = f"""
Extract structured data from this healthcare interaction.

Today's date is: {today}

Return ONLY valid JSON in this exact format, no extra text:
{{
  "hcpName": "",
  "interactionType": "",
  "date": "",
  "time": "",
  "attendees": "",
  "topicsDiscussed": "",
  "materialsShared": [],
  "samplesDistributed": [],
  "sentiment": "",
  "outcomes": "",
  "followUpActions": "",
  "aiSuggestedFollowUps": []
}}

Rules:
- Extract doctor's name → hcpName
- If "met" or "meeting" → interactionType = "Meeting"
- If "call" → interactionType = "Call"
- Sentiment: use "Positive", "Negative", or "Neutral" only
- If date not given → use today's date: {today} in YYYY-MM-DD format
- If time not given → leave empty string
- Notes/discussion → topicsDiscussed
- Brochures/materials shared → put in materialsShared as array
- Samples → samplesDistributed as array
- Outcome of meeting → outcomes
- Follow up suggestions → aiSuggestedFollowUps as array

Input:
{input_text}
"""
    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if "```" in content:
            content = content.split("```")[1]
            content = content.replace("json", "").strip()
        data = json.loads(content)
        if data.get("date", "").lower() == "today" or not data.get("date"):
            data["date"] = today
        return data
    except:
        return {
            "hcpName": "", "interactionType": "Meeting", "date": today,
            "time": "", "attendees": "", "topicsDiscussed": input_text,
            "materialsShared": [], "samplesDistributed": [],
            "sentiment": "Neutral", "outcomes": "", "followUpActions": "",
            "aiSuggestedFollowUps": []
        }


def edit_interaction_tool(input_text: str) -> dict:
    prompt = f"""You are a JSON extractor. Your job is to find what fields need to be updated in a CRM form.

Available fields:
- hcpName: doctor or person name
- interactionType: Meeting, Call, Email, Conference
- date: date in YYYY-MM-DD format
- time: time in HH:MM format
- attendees: people present
- topicsDiscussed: what was discussed
- sentiment: MUST be exactly one of "Positive", "Negative", "Neutral"
- outcomes: results or agreements
- followUpActions: next steps

STRICT RULES:
1. Return ONLY a JSON object
2. Include ONLY the fields mentioned in the input
3. For sentiment, always use "Positive", "Negative", or "Neutral"
4. Do NOT return empty {{}}
5. No explanation, no markdown, just JSON

Example 1:
Input: "Sorry name was Dr. John and sentiment was negative"
Response: {{"hcpName": "Dr. John", "sentiment": "Negative"}}

Example 2:
Input: "Change the doctor to Dr. Patel"
Response: {{"hcpName": "Dr. Patel"}}

Now extract from this input:
Input: "{input_text}"
Response:"""

    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if "```" in content:
            content = content.split("```")[1].replace("json", "").strip()
        match = re.search(r'\{[^{}]+\}', content, re.DOTALL)
        if match:
            content = match.group()
        data = json.loads(content)
        if "sentiment" in data:
            s = data["sentiment"].lower()
            if "positive" in s:
                data["sentiment"] = "Positive"
            elif "negative" in s:
                data["sentiment"] = "Negative"
            else:
                data["sentiment"] = "Neutral"
        return data
    except Exception as e:
        print(f"edit_interaction_tool error: {e}")
        return {}


def clear_form_tool(input_text: str) -> dict:
    return {}


def summarize_interaction_tool(input_text: str) -> dict:
    prompt = f"""
Summarize the interaction in 1-2 lines.
Return ONLY JSON: {{"topicsDiscussed": "summary here"}}
Input: {input_text}
"""
    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if "```" in content:
            content = content.split("```")[1].replace("json", "").strip()
        return json.loads(content)
    except:
        return {"topicsDiscussed": response.content.strip()}


def suggest_followup_tool(input_text: str) -> dict:
    prompt = f"""
Suggest 3 follow-up actions based on this healthcare interaction.
Return ONLY JSON: {{"aiSuggestedFollowUps": ["action 1", "action 2", "action 3"]}}
Input: {input_text}
"""
    response = llm.invoke(prompt)
    try:
        content = response.content.strip()
        if "```" in content:
            content = content.split("```")[1].replace("json", "").strip()
        return json.loads(content)
    except:
        return {"aiSuggestedFollowUps": [response.content.strip()]}


# ---------------- STATE ---------------- #

class State(TypedDict):
    input: str
    tool_name: str
    data: dict


# ---------------- GRAPH LOGIC ---------------- #

def decide_tool(state: State) -> State:
    prompt = f"""You are a tool selector. Choose exactly one tool name from this list:

log_interaction
edit_interaction
clear_form
summarize_interaction
suggest_followup

Rules:
- User describes meeting/interaction with doctor → log_interaction
- User says sorry/correction/actually/change/update/wrong → edit_interaction
- User says clear/reset/empty → clear_form
- User says summarize → summarize_interaction
- User asks for suggestions/next steps/follow up → suggest_followup

Return ONLY the tool name. No explanation. No punctuation.

Input: {state['input']}"""

    response = llm.invoke(prompt)
    tool_name = response.content.strip().lower()
    tool_name = tool_name.replace(".", "").replace("-", "_").replace(" ", "_")

    valid_tools = ["log_interaction", "edit_interaction", "clear_form", "summarize_interaction", "suggest_followup"]
    if tool_name not in valid_tools:
        tool_name = "log_interaction"

    return {"tool_name": tool_name}


def call_tool(state: State) -> State:
    tool_name = state["tool_name"]
    input_text = state["input"]

    if tool_name == "log_interaction":
        data = log_interaction_tool(input_text)
    elif tool_name == "edit_interaction":
        data = edit_interaction_tool(input_text)
    elif tool_name == "clear_form":
        data = clear_form_tool(input_text)
    elif tool_name == "summarize_interaction":
        data = summarize_interaction_tool(input_text)
    elif tool_name == "suggest_followup":
        data = suggest_followup_tool(input_text)
    else:
        data = {}

    return {"data": data}


# ---------------- GRAPH ---------------- #

graph = StateGraph(State)
graph.add_node("decide", decide_tool)
graph.add_node("call", call_tool)
graph.add_edge("decide", "call")
graph.set_entry_point("decide")
app_graph = graph.compile()


# ---------------- FASTAPI ---------------- #

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- MODELS ---------------- #

class AgentInput(BaseModel):
    input: str


class Interaction(BaseModel):
    hcpName: str
    interactionType: str
    dateTime: str
    notes: str
    outcome: str
    followUp: str


# ---------------- ROUTES ---------------- #

@app.post("/agent")
async def run_agent(input_data: AgentInput):
    try:
        result = app_graph.invoke({"input": input_data.input})
        return {"tool": result["tool_name"], "data": result["data"]}
    except Exception as e:
        return {"error": str(e)}


@app.post("/interactions")
async def log_interaction(interaction: Interaction):
    db = SessionLocal()
    try:
        db_interaction = InteractionModel(
            hcp_name=interaction.hcpName,
            interaction_type=interaction.interactionType,
            date_time=interaction.dateTime,
            notes=interaction.notes,
            outcome=interaction.outcome,
            follow_up=interaction.followUp
        )
        db.add(db_interaction)
        db.commit()
        db.refresh(db_interaction)
        return {"status": "success", "message": "Interaction saved to database!", "id": db_interaction.id}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@app.get("/interactions")
async def get_interactions():
    db = SessionLocal()
    try:
        interactions = db.query(InteractionModel).all()
        return {"interactions": [
            {
                "id": i.id,
                "hcpName": i.hcp_name,
                "interactionType": i.interaction_type,
                "dateTime": i.date_time,
                "notes": i.notes,
                "outcome": i.outcome,
                "followUp": i.follow_up
            } for i in interactions
        ]}
    finally:
        db.close()


@app.get("/test")
async def test():
    return {"ok": True}


@app.get("/")
async def root():
    return {"message": "AI CRM API is running 🚀"}