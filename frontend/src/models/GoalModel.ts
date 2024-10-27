import { Timestamp } from "firebase/firestore"

export type GoalModel = {
    created_at: Timestamp,
    created_uid: string,
    created_username: string,
    completed_books: number,
    goal_amount: number,
    goal_name: string,
    is_done: boolean
}