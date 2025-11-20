from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
def read_root():
    return {"message": "Hello from Python Backend!"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
