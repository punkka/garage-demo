import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { fetchAdminParked, fetchStatus } from '../api';
import { AdminParkingResponse, StatusResponse } from '../types';

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminParkingResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse>({ availableSpaces: 0, isFull: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusResponse, adminResponse] = await Promise.all([fetchStatus(), fetchAdminParked()]);
      setStatus(statusResponse);
      setAdminData(adminResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  return (
    <Container maxWidth="lg" className="app-shell">
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Overview
        </Typography>
        <Typography variant="subtitle1">
          Monitor parked cars and available spaces.
        </Typography>
      </Box>

      <Box mb={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Alert severity={status.isFull ? 'error' : 'success'} sx={{ flex: '1 1 320px' }}>
          {status.isFull ? 'Garage is full.' : `${status.availableSpaces} spaces available.`}
        </Alert>
        <Button variant="contained" onClick={refreshAdmin} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Grid container spacing={2}>
        {adminData?.activeCars.length ? (
          adminData.activeCars.map((car) => (
            <Grid key={`${car.spaceNumber}-${car.licensePlate}`} item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Space {car.spaceNumber}</Typography>
                  <Typography>Plate: {car.licensePlate}</Typography>
                  <Typography>Entered at: {new Date(car.enteredAt).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>No cars are currently parked.</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
