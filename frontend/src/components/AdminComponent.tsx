import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { DocumentData, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import * as FirebaseService from '@services/FirebaseService';


type Props = {
    setReportData: (p: DocumentData) => void,
}

function AdminComponent({setReportData} : Props) {
    const [selectedTab, setSelectedTab] = useState(0);
    const [reportUserList, setReportUserList] = useState<DocumentData[]>([]);
    const [reportCommentList, setReportCommentList] = useState<DocumentData[]>([]);

    const reasonMap = {
        offensive: 'Sértő tartalom vagy tevékenység.',
        risk: 'Biztonsági kockázatok vagy visszaélések.',
        spam: 'Tiltott tevékenység/Spam.',
        behaviour: 'Nem megfelelő viselkedés a közösségben.',
        other: 'Egyéb'
    }

    useEffect(() => {
        const reportsRef = FirebaseService.getCollectionByID('reports') 
        const unsubscribe = onSnapshot(reportsRef, (querySnapshot) => {
          const reports: DocumentData[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setReportUserList(reports.filter((doc: DocumentData) => doc.content_type === 'user'));
          setReportCommentList(reports.filter((doc: DocumentData) => doc.content_type === 'comment' || doc.content_type === 'review'));
        }, (error) => {
          console.error('Error fetching data:', error);
        });
      
        return () => unsubscribe();
    }, []);

    // Tab váltás kezelése
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    async function handleReportClick(report: DocumentData) {
        setReportData(report);
    }

    const renderReports = (reportList: DocumentData[]) => (
        <Box
            sx={{
            padding: 2,
            borderRadius: '8px',
            height: '100%',
            }}
        >
            {reportList.map((report: DocumentData) => (
            <Paper
                key={report.id}
                sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 1,
                width:'100%',
                marginBottom: 1,
                borderRadius: 3,
                backgroundColor: '#eae2ca',
                color: '#895737',
                '&:hover': {
                    backgroundColor: '#f0f0f0',
                },
                }}
                onClick={() => handleReportClick(report)}
            >
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold',  }}>
                        {reasonMap[report.reason]}
                    </Typography>
                </Box>
            </Paper>
            ))}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: '85vh'}}>
            {/* Bal oldali sáv tab navigációval */}
            <Box
            sx={{
                width: 500,
                backgroundColor: '#fff',
                boxShadow: '2px 0px 10px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: 1,
                overflowY: 'auto',
                overflow: 'visible',
                borderRight: '1px solid #d1cfcf',
                flexDirection: 'column',
                position: 'relative',
            }}
            >
                {/* Tab navigáció */}
                <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange} 
                    centered 
                    sx={{
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#794f29', 
                    },
                    }}
                >
                    <Tab label="Tartalom moderálás"
                    sx={{ 
                        color:'#794f29', 
                        '&.Mui-selected': {
                        color: '#794f29',
                        },
                    }}
                    />
                    <Tab label="Felhasználó moderálás" 
                    sx={{
                        color:'#794f29', 
                        '&.Mui-selected': {
                        color: '#794f29',
                        },
                    }}
                    />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(85vh - 100px)' }}>
                    {selectedTab === 0 && (
                        <Box>
                            {renderReports(reportCommentList)}
                        </Box>
                    )}
                    {selectedTab === 1 && (
                        <Box>
                            {renderReports(reportUserList)} 
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default AdminComponent;
