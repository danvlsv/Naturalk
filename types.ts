export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Unified Marker type
export interface MarkerData {
  id: number; // Primary key
  latitude: number;
  longitude: number;
  title: string; // Optional title for app use
  createdAt?: string; // Optional timestamp for database use
}

// Unified Image type
export interface Image {
  id: number; // Primary key
  markerId: number; // Foreign key to Marker
  uri: string; // Image URI
  createdAt?: string; // Optional timestamp for database use
}
export interface MarkerDetailsParams {
  id: number;
}

export type MarkerCollection = MarkerData[];
