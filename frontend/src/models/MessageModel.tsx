import { Timestamp } from "firebase/firestore";

export type MessageModel = {
    id: string,
    user: string,
    text: string,
    created_at: Timestamp,
    room_id: string,
}