from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    auth_router,
    booths_router,
    services_router,
    transactions_router,
    dashboard_router,
)

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
    return RedirectResponse(url="/login.html")


frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
