"""TTMC – FastAPI backend: sert les questions depuis questions.json."""

import json
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

DATA_PATH = Path(__file__).parent / "questions.json"

_data: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _data
    _data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    yield


app = FastAPI(title="TTMC API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/questions")
def get_questions():
    """Retourne toutes les questions par catégorie."""
    return _data["categories"]


@app.get("/api/finale")
def get_finale():
    """Retourne les questions finale 'N'hésite pas à gagner'."""
    return _data["finale"]


@app.get("/api/debut")
def get_debut():
    """Retourne les cartes 'Hésite pas à débuter'."""
    return _data["debut"]
