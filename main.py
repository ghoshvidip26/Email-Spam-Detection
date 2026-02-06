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
    temperature=0,
    format="json"
)

@app.post("/checkURL")
async def checkURL(req: emailCheckRequest):
    email_text = req.emailBody[:3000]
    prompt = f"""
Analyze the following email for 3 specific safety signals. 

RULES:
1. URGENCY: Set to true ONLY for high-pressure threats or immediate deadlines (e.g., 'within 1 hour'). 
   - NOTE: Normal job recruitment phrases like 'to move forward' or 'complete application' are NOT urgent.
2. THREAT: Set to true if there is a threat of harm, account loss, or legal action.
3. SENSITIVE_REQUEST: Set to true if asking for sensitive data (passwords, OTPs, SSN) OR if asking for ANY payment/fee.
   - NOTE: Any internship or job asking for a 'nominal fee', 'training fee', or 'certification fee' MUST be flagged as sensitive_request=true.

Email:
{email_text}

Return valid JSON:
{{
  "urgency": boolean,
  "threat": boolean,
  "sensitive_request": boolean,
  "explanation": "A single sentence explaining why any flags were raised, or stating the email looks safe."
}}
"""


    response = llm.invoke(
        prompt + "\n\nIMPORTANT: Respond with ONLY valid JSON. No extra text."
    )
    print(response.content)

    return {
        "signals": response.content
    }
