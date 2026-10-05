from fastapi import FastAPI
from app.api.routes import booths_router, services_router, transactions_router, dashboard_router
from app.seed import init_db

app = FastAPI(title="Wina Bwangu API", version="1.0.0")

app.include_router(booths_router)
app.include_router(services_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)



@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Wina Bwangu API is running", "docs": "/docs"}