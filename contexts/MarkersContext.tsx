import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarkerData } from '@/types';

interface MarkersContextType {
  markers: MarkerData[];
  addMarker: (marker: MarkerData) => void;
  updateMarker: (marker: MarkerData) => void;
  deleteMarker: (id: string) => void;
  getMarkerById: (id: string) => MarkerData | undefined;
}

const MarkersContext = createContext<MarkersContextType | undefined>(undefined);

const STORAGE_KEY = '@markers_storage';

export function MarkersProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load markers from AsyncStorage on mount
  useEffect(() => {
    loadMarkers();
  }, []);

  // Save markers to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveMarkers();
    }
  }, [markers, isLoaded]);

  const loadMarkers = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        const loadedMarkers = JSON.parse(jsonValue);
        // Convert createdAt strings back to Date objects
        const parsedMarkers = loadedMarkers.map((marker: any) => ({
          ...marker,
          createdAt: new Date(marker.createdAt),
        }));
        setMarkers(parsedMarkers);
      }
    } catch (error) {
      console.error('Error loading markers:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveMarkers = async () => {
    try {
      const jsonValue = JSON.stringify(markers);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving markers:', error);
    }
  };

  const addMarker = (marker: MarkerData) => {
    setMarkers((prev) => [...prev, marker]);
  };

  const updateMarker = (updatedMarker: MarkerData) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === updatedMarker.id ? updatedMarker : marker
      )
    );
  };

  const deleteMarker = (id: string) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  };

  const getMarkerById = (id: string) => {
    return markers.find((marker) => marker.id === id);
  };

  return (
    <MarkersContext.Provider
      value={{ markers, addMarker, updateMarker, deleteMarker, getMarkerById }}
    >
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers() {
  const context = useContext(MarkersContext);
  if (context === undefined) {
    throw new Error('useMarkers must be used within a MarkersProvider');
  }
  return context;
}
