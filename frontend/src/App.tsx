import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import EntrancePage from './pages/EntrancePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Garage Demo
            </Typography>
            <Button
              color="inherit"
              component={NavLink}
              to="/"
              end
              sx={{ '&.active': { fontWeight: 'bold' } }}
            >
              Entrance
            </Button>
            <Button
              color="inherit"
              component={NavLink}
              to="/admin"
              sx={{ '&.active': { fontWeight: 'bold' } }}
            >
              Admin
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box mt={3}>
        <Routes>
          <Route path="/" element={<EntrancePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
