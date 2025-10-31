export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface MarkerData {
  id: string;
  coordinate: Coordinate;
  title: string;
  description: string;
  images: string[];
  createdAt: Date;
}

export interface MarkerDetailsParams {
  id: string;
}

export type MarkerCollection = MarkerData[];
