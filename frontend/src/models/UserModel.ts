import { Timestamp } from "firebase/firestore"

export type GoogleUserModel = {
    avatar_url: string,
    email: string,
    firstname: string,
    lastname: string,
    followers: Array<string>,
    followig: Array<string>,
    is_admin: boolean,
    uid: string,
    username: string,
}

export type UserModel = GoogleUserModel & {
    birth_date: Timestamp,
    gender: string,
    password: string,
}