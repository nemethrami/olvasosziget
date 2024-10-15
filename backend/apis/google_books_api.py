from fastapi import APIRouter, HTTPException
from os import environ
from httpx import AsyncClient

router = APIRouter()


@router.get("/books_by_name", response_model=list)
async def list_books_by_name(book: str):
    GOOGLE_API_KEY = environ.get("API_KEY", "AIzaSyCZ0PamLM1OwHLSQ-qNab8hUhHGjGr0Bjs")
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google Books API key is missing")
    
    URL = "https://www.googleapis.com/books/v1/volumes"
    PARAMS = {
        "q": book,
        "key": GOOGLE_API_KEY,
        "maxResults": 40
    }

    async with AsyncClient() as client:
        resp = await client.get(url=URL, params=PARAMS)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", [])