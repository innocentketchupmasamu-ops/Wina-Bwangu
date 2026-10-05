from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import booths_router, services_router, transactions_router, dashboard_router
from app.api.routes.auth import router as auth_router

app = FastAPI(title="Wina Bwangu API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(booths_router)
app.include_router(services_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)


@app.get("/")
async def root():
    return {"message": "Wina Bwangu API is running", "docs": "/docs"}
