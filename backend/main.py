from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.middleware.cors import CORSMiddleware
from bson import ObjectId

from database import db_conn
from apis.account_api import router as account_router
from apis.google_books_api import router as google_books_api_router

# TODO: hash user password before storing it in db

app = FastAPI()

# Define origins
origins = [
    "http://localhost",
    "http://localhost:8080",
]

# Add cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}


@app.on_event("shutdown")
async def shutdown_db_client():
    if db_conn.db_connection is not None:
        db_conn.db_connection.close()
        print("Disconnected from MySQL!")


# Add routers to the app
app.include_router(account_router)
app.include_router(google_books_api_router)