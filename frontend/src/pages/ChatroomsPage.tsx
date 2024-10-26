import { Box } from "@mui/material";
import AppFrame from "../components/AppFrame";
import ChatRooms from "../components/Chatrooms";
import ChatRoom from "../components/Chatroom";
import { useState } from "react";
import { DocumentData } from "firebase/firestore";

export default function ChatRoomsPage() {
    const [roomName, setRoomName] = useState<string>('');
    const [roomData, setRoomData] = useState<DocumentData>({});

    return (
        <AppFrame>
            <Box sx={{ display: 'flex', height: '85vh' }}>
                {/* Bal oldalon a szobák listája */}
                <Box sx={{ width: '25%', borderRight: '1px solid #d1cfcf' }}>
                    <ChatRooms setRoomName={setRoomName} setRoomData={setRoomData}/>
                </Box>

                {/* Jobb oldalon a csevegőszoba */}
                {roomName && (
                    <Box sx={{ flex: 1 }}>
                        <ChatRoom id={roomName} roomData={roomData}/>
                    </Box>
                )}
            </Box>
        </AppFrame>
    );
}