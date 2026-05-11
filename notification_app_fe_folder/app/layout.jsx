import { WxNotifProvider } from "../src/state/notifStore.js";
import { Box, Container } from "@mui/material";

export const metadata = {
    title: "Campus Notification Platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <WxNotifProvider>
                    <Container maxWidth="sm">
                        <Box sx={{ py: 4 }}>
                            {children}
                        </Box>
                    </Container>
                </WxNotifProvider>
            </body>
        </html>
    );
}
