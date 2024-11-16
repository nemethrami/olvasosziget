import { DocumentData, Timestamp } from "firebase/firestore"

export type ReportModel = {
    created_uid: string,
    created_at: Timestamp,
    content_type: 'user' | 'comment' | 'review',
    reason: 'spam' | 'offensive' | 'risk' | 'behaviour' | 'other',
    explanation: string,
    reported_content: string,
    comment?: DocumentData,
}