# AI CRM Application - HCP Interaction Logger
---

# Project Overview

This project is an AI-based CRM (Customer Relationship Management) application designed specifically for managing interactions with Healthcare Professionals (HCPs).

The main idea behind this project is to make it easier for field representatives to log their interactions. Instead of always filling long forms manually, users can simply describe the interaction in normal language, and the system automatically fills the required details using AI.

The application provides two ways to log data:

* A structured form
* An AI-powered chat interface

---

# Tech Stack

The following technologies were used to build this project:

* **Frontend:** React.js with Redux Toolkit
* **Backend:** Python with FastAPI
* **AI Agent:** LangGraph
* **LLM:** Groq (llama-3.3-70b-versatile)
* **Database:** SQLite using SQLAlchemy
* **Font:** Google Inter

> Note: Initially, the requirement mentioned using `gemma2-9b-it`, but since it has been deprecated by Groq, I used `llama-3.3-70b-versatile` as a replacement.

---

# AI Agent (LangGraph) Working

The AI agent is the core part of this application. It takes user input in natural language and decides what action needs to be performed.

# Basic Flow:

User Input → Tool Selection → Tool Execution → Form Update

The agent identifies the intent of the user and calls the appropriate tool to perform the task.

---

# Implemented Tools

The following tools are implemented inside the AI agent:

1. **log_interaction**
   Converts user input into structured data and fills the form

2. **edit_interaction**
   Updates only specific fields based on corrections

3. **clear_form**
   Clears all the form fields

4. **summarize_interaction**
   Generates a short summary of the interaction

5. **suggest_followup**
   Provides AI-based suggestions for next steps

---

# Project Structure

```
AI CRM APPLICATION/
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── store.js
│       ├── formSlice.js
│       ├── chatSlice.js
│       └── index.js
└── README.md
```

---

# Setup Instructions

# Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate

pip install fastapi uvicorn langchain-groq langgraph python-dotenv sqlalchemy

echo GROQ_API_KEY=your_api_key_here > .env

uvicorn app.main:app --reload
```

Backend runs on: `http://127.0.0.1:8000`

---

# Frontend Setup

```bash
cd frontend
npm install
npm install @reduxjs/toolkit react-redux
npm start
```

Frontend runs on: `http://localhost:3000`

---

# How to Use

1. Open the application in the browser
2. Use the AI Assistant panel
3. Enter interaction details in normal language
4. The form will automatically update

---

# Example Inputs

**Logging an interaction:**

```
Today I met Dr. Smith and discussed product X efficiency. 
Sentiment was positive, shared brochures.
```

**Editing details:**

```
The name was Dr. John and sentiment was negative.
```

**Other commands:**

* Clear the form
* Summarize the interaction
* Suggest follow-up actions

---

# API Endpoints

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| POST   | /agent        | Runs AI agent    |
| POST   | /interactions | Saves data       |
| GET    | /interactions | Fetches all data |
| GET    | /test         | Health check     |
| GET    | /             | Root endpoint    |

---

# Database

SQLite database (`crm.db`) is created automatically.

**Table: interactions**

* id
* hcp_name
* interaction_type
* date_time
* notes
* outcome
* follow_up

---



Riya Kumari
B.Tech CSE (AI)

---
