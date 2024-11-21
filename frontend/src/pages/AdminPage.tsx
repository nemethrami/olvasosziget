import { Box } from "@mui/material";
import AdminComponent from "@components/AdminComponent";
import AppFrame from "@components/AppFrame";
import { useState } from "react";
import ContentComponent from "@components/ContentComponent";
import { DocumentData } from "firebase/firestore";


export default function AdminPage() {
    const [reportData, setReportData] = useState<DocumentData | null>(null);

    return (
        <AppFrame> 
            <Box sx={{ display: 'flex', height: '85vh' }}>
                <Box sx={{ width: '38%', borderRight: '1px solid #d1cfcf' }}>
                    <AdminComponent setReportData={setReportData} />
                </Box>

                {reportData && (
                    <Box sx={{ flex: 1 }}>
                        <ContentComponent reportData={reportData} />
                    </Box>
                )}
            </Box>
        </AppFrame>
    );
  }