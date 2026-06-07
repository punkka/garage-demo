import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Container,
} from '@mui/material';
import { fetchSpaces, fetchStatus, enterCar, exitCar } from '../api';
import { AdminParkingResponse, Space, StatusResponse } from '../types';

const formatCost = (cents: number) => `€${(cents / 100).toFixed(2)}`;

export default function EntrancePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [status, setStatus] = useState<StatusResponse>({ availableSpaces: 0, isFull: false });
  const [licensePlateEntry, setLicensePlateEntry] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [exitLicensePlate, setExitLicensePlate] = useState('');
  const [exitMessage, setExitMessage] = useState<string | null>(null);
  const [exitError, setExitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [statusResponse, spaceList] = await Promise.all([fetchStatus(), fetchSpaces()]);
      setStatus(statusResponse);
      setSpaces(spaceList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleEntry = async () => {
    setEntryMessage(null);
    setEntryError(null);

    if (!licensePlateEntry.trim() || selectedSpace === null) {
      setEntryError('A license plate and parking space are required.');
      return;
    }

    try {
      await enterCar({ licensePlate: licensePlateEntry.trim(), spaceNumber: selectedSpace });
      setEntryMessage(`Car entered into space ${selectedSpace}.`);
      setLicensePlateEntry('');
      setSelectedSpace(null);
      refreshDashboard();
    } catch (error) {
      if (error instanceof Error) {
        const status = (error as any).status;
        if (status === 409) {
          setEntryError(
            'That license plate is already parked in another space. Please exit the existing car first or use a different plate.'
          );
        } else {
          setEntryError(error.message);
        }
      } else {
        setEntryError('Unable to register entry.');
      }
    }
  };

  const handleExit = async () => {
    setExitMessage(null);
    setExitError(null);

    if (!exitLicensePlate.trim()) {
      setExitError('A license plate is required to exit.');
      return;
    }

    try {
      const response = await exitCar({ licensePlate: exitLicensePlate.trim() });
      setExitMessage(`Car exited from space ${response.spaceNumber}. Cost: ${formatCost(response.costCents)}.`);
      setExitLicensePlate('');
      refreshDashboard();
    } catch (error) {
      setExitError(error instanceof Error ? error.message : 'Unable to process exit.');
    }
  };

  return (
    <Container maxWidth="lg" className="app-shell">
      <Box mb={4} textAlign="center">
        <Typography variant="h3" component="h1" gutterBottom>
          Garage Entrance
        </Typography>
        <Typography variant="subtitle1">
          Capacity: 5 spaces. First 3 hours €0.50 per 10 minutes, then €0.30 per 10 minutes.
        </Typography>
      </Box>

      <Box mb={3}>
        <Alert severity={status.isFull ? 'error' : 'success'}>
          {status.isFull ? 'Garage is full.' : `${status.availableSpaces} spaces available.`}
        </Alert>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Car
              </Typography>
              <TextField
                fullWidth
                label="License Plate"
                value={licensePlateEntry}
                onChange={(event) => setLicensePlateEntry(event.target.value)}
                margin="normal"
              />
              <Typography variant="body2" gutterBottom>
                Select a parking space.
              </Typography>
              <Box className="space-grid">
                {spaces.map((space) => (
                  <Button
                    key={space.space_number}
                    variant={selectedSpace === space.space_number ? 'contained' : 'outlined'}
                    color={space.is_vacant ? 'primary' : 'inherit'}
                    disabled={!space.is_vacant}
                    onClick={() => setSelectedSpace(space.space_number)}
                    className={selectedSpace === space.space_number ? 'space-button selected' : 'space-button'}
                  >
                    {space.space_number}
                  </Button>
                ))}
              </Box>
              {entryMessage && <Alert severity="success" className="message-box">{entryMessage}</Alert>}
              {entryError && <Alert severity="error" className="message-box">{entryError}</Alert>}
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={handleEntry} disabled={loading || status.isFull}>
                Enter Car
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exit Car
              </Typography>
              <TextField
                fullWidth
                label="License Plate"
                value={exitLicensePlate}
                onChange={(event) => setExitLicensePlate(event.target.value)}
                margin="normal"
              />
              {exitMessage && <Alert severity="success" className="message-box">{exitMessage}</Alert>}
              {exitError && <Alert severity="error" className="message-box">{exitError}</Alert>}
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={handleExit} disabled={loading}>
                Exit Car
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Divider />
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Parking Spaces
        </Typography>
        <Grid container spacing={2}>
          {spaces.map((space) => (
            <Grid key={space.space_number} item xs={6} sm={4} md={2}>
              <Card className={space.is_vacant ? 'space-card vacant' : 'space-card occupied'}>
                <CardContent>
                  <Typography variant="h6">Space {space.space_number}</Typography>
                  <Typography>{space.is_vacant ? 'Vacant' : 'Occupied'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
