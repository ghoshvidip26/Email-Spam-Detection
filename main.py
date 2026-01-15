from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os 
from fastapi.middleware.cors import CORSMiddleware
from langchain_ollama import ChatOllama


load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class emailCheckRequest(BaseModel): 
    emailBody: str 
    
llm = ChatOllama(
    model="llama3",
    temperature=0
)

@app.post("/checkURL")
async def checkURL(req: emailCheckRequest):
    print("Request: ",req)
    prompt = f"""
You are analyzing an email for safety signals.

Detect ONLY:
1. Urgency or pressure
2. Threats
3. Requests for sensitive data

Return valid JSON only:

{{
  "urgency": true | false,
  "threat": true | false,
  "sensitive_request": true | false,
  "explanation": "short reason"
}}

Email:
{req.emailBody}
"""

    response = llm.invoke(prompt)
    print(response.content)

    return {
        "signals": response.content
    }
