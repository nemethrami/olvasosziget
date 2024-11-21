import { Timestamp } from "firebase/firestore"
import { BookModel } from "@models/BookModel"

export type CommentModel = {
    username: string,
    text: string,
    created_at: Timestamp
}

export type ReviewModel = {
    book: BookModel,
    created_uid: string,
    created_at: Timestamp,
    created_username: string,
    comments: Array<CommentModel>,
    likes: Array<string>,
    rating: number,
    text: string,
}