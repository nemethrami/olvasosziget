import { BookModel } from "./BookModel"

export type CommentModel = {
    username: string,
    text: string,
    created_at: Date
}

export type ReviewModel = {
    book: BookModel,
    created_uid: string,
    created_at: Date,
    comments: Array<CommentModel>,
    likes: Array<string>,
    rating: number,
    text: string,
}