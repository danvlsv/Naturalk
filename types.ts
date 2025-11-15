export interface Coordinate {
  latitude: number;
  longitude: number;
}


export interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  createdAt?: string;
}


export interface Image {
  id: number;
  markerId: number;
  uri: string;
  createdAt?: string;
}
export interface MarkerDetailsParams {
  id: number;
}

export type MarkerCollection = MarkerData[];
