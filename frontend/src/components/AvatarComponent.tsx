import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { getCurrentUser, getDocData } from "../services/FirebaseService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/FirebaseConfig";

type Props = {
    onClick ?: () => void,
    aUrl ?: string,
    sx ?: Record<string,unknown>,

}

export default function AvatarComponent({ onClick, aUrl, sx }: Props) {
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    const getAvatarUrl = async () => {
        try {
            const currentUser = getCurrentUser();
        
            if (!currentUser || localStorage.getItem('avatarUrl')) {
                return;
            }
        
            const data = await getDocData('users', currentUser.uid);
            const fetchedUrl = data ? data.avatar_url : '';
            console.log(fetchedUrl)
        
            localStorage.setItem('avatarUrl', fetchedUrl);
            setAvatarUrl(fetchedUrl);
        } catch (error) {
            console.error('Error fetching avatar URL:', error);
        }
    };
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                getAvatarUrl();
            } else {
                localStorage.removeItem('avatarUrl');
                setAvatarUrl('');
            }
        });
        
        return () => unsubscribe();
    }, []);

    return <Avatar 
                alt='User avatar' 
                src={aUrl || aUrl === '' ? aUrl : localStorage.getItem('avatarUrl') || avatarUrl}
                sx={sx}
                onClick={onClick}
            >
            </Avatar>
}