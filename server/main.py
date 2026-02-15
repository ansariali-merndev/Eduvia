from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
async def root():
    content = {
        "success": True,
        "message": "Welcome back to the FASTAPI application"
    }
    return JSONResponse(
        status_code=200,
        content=content
    )

@app.get("/hello")
async def hello():
    return "Hello World"