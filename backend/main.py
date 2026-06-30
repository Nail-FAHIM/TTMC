"""TTMC – FastAPI backend: sert les questions depuis questions.json."""

import json
import random
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATA_PATH = Path(__file__).parent / "questions.json"

app = FastAPI(title="TTMC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_data: dict = {}


@app.on_event("startup")
def load_data():
    global _data
    _data = json.loads(DATA_PATH.read_text(encoding="utf-8"))


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
