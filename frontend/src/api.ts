import { AdminParkingResponse, EntryPayload, ExitPayload, Space, StatusResponse } from './types';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

async function parseResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Server error');
  }
  return payload;
}

export async function fetchStatus(): Promise<StatusResponse> {
  const response = await fetch(`${backendUrl}/api/status`);
  return parseResponse(response);
}

export async function fetchSpaces(): Promise<Space[]> {
  const response = await fetch(`${backendUrl}/api/spaces`);
  return parseResponse(response);
}

export async function enterCar(data: EntryPayload) {
  const response = await fetch(`${backendUrl}/api/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseResponse(response);
}

export async function exitCar(data: ExitPayload) {
  const response = await fetch(`${backendUrl}/api/exit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseResponse(response);
}

export async function fetchAdminParked(): Promise<AdminParkingResponse> {
  const response = await fetch(`${backendUrl}/api/admin/parked`);
  return parseResponse(response);
}
