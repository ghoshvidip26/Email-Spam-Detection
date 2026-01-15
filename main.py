from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os 
from google import genai
from fastapi.middleware.cors import CORSMiddleware
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class URLCheckRequest(BaseModel): 
    url: str 

@app.post('/checkURL')
async def checkURL(request: URLCheckRequest): 
    prompt = f"Check if the following URL is a phishing site. Answer in Yes or No only. URL: {request.url}"
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,  # Direct string or list of strings/parts
        config=types.GenerateContentConfig(
            system_instruction="You are a cybersecurity analyst whose expertise lies in analyzing website URLs to detect phishing sites."
        )
    )
    print(response)
    
    return {"result": response.text}