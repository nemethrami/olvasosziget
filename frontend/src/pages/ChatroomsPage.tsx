import { Box, Drawer, IconButton } from "@mui/material";
import AppFrame from "@components/AppFrame";
import ChatRooms from "@components/Chatrooms";
import ChatRoom from "@components/Chatroom";
import { useState } from "react";
import { DocumentData } from "firebase/firestore";
import MenuIcon from '@mui/icons-material/Menu';

export default function ChatRoomsPage() {
    const [roomName, setRoomName] = useState<string>('');
    const [roomData, setRoomData] = useState<DocumentData>({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <AppFrame>
            <Box sx={{ display: 'flex', minHeight: '85vh', alignItems: 'start', marginBottom: 1 }}>
                <IconButton 
                    sx={{ display: { xs: 'flex', sm: 'none' }, position: 'absolute', paddingLeft: 0, paddingTop: 0.5 }} 
                    onClick={toggleSidebar}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, minWidth: '20%', maxWidth: '30%', marginRight: 2 }}>
                    <ChatRooms setRoomName={setRoomName} setRoomData={setRoomData} />
                </Box>

                <Drawer
                    anchor="left"
                    open={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{
                        sx: {
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: '65%',
                            position: 'absolute',
                            zIndex: '10',
                        },
                    }}
                    container={document.querySelector('#sidebar-container')}
                    variant="temporary"
                >
                    <Box sx={{ padding: 2, marginTop: 7 }}>
                        <ChatRooms setRoomName={setRoomName} setRoomData={setRoomData} toggleSidebar={toggleSidebar} />
                    </Box>
                </Drawer>

                <Box sx={{ flex: 1, height: '100%', marginBottom: 2 }}>
                    {roomName ? (
                        <ChatRoom id={roomName} roomData={roomData} />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', height: '85vh' }}>
                            <Box sx={{ color: '#895737' }}>
                                Válassz ki egy chat szobát a beszélgetéshez!
                            </Box>
                            <Box></Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </AppFrame>
    );
}