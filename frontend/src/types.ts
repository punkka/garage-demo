export interface Space {
  space_number: number;
  is_vacant: boolean;
}

export interface StatusResponse {
  availableSpaces: number;
  isFull: boolean;
}

export interface EntryPayload {
  licensePlate: string;
  spaceNumber: number;
}

export interface ExitPayload {
  licensePlate: string;
}

export interface AdminParkingResponse {
  availableSpaces: number;
  activeCars: Array<{ spaceNumber: number; licensePlate: string; enteredAt: string }>;
}
