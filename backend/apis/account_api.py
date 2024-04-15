from fastapi import APIRouter
from pydantic import BaseModel

from database import db_conn

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


@router.post("/create-account", response_model=dict)
async def create_account(user_data: UserCreate):
    
    new_user_id = str(1)
    return {"message": f"Account created. ID: {new_user_id}"}


@router.get("/accounts", response_model=list)
async def list_users():
    users = []
    return users