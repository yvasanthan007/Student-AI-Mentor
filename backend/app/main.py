from fastapi import FastAPI

app = FastAPI(title="MentorAI API")

@app.get("/")
def home():
    return {
        "message": "MentorAI Backend Running"
    }