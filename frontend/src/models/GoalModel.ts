import { Timestamp } from "firebase/firestore"
import { BookModel } from "./BookModel"

export type GoalBooksModel = {
    book: BookModel,
    is_checked: boolean
}

export type GoalModel = {
    created_at: Timestamp,
    created_uid: string,
    created_username: string,
    completed_books: number,
    goal_amount: number,
    goal_name: string,
    is_done: boolean,
    target_date: Timestamp,
    books_to_read: Array<GoalBooksModel>
}