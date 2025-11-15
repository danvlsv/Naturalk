import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseOperations } from '../database/operations';
import { initDatabase } from '../database/schema'; // Assuming your DB init code is here
import { Image, MarkerCollection, MarkerData } from '../types';

interface MarkersContextType {
  markers: MarkerCollection;
  addMarker: (marker: MarkerData) => Promise<void>;
  getMarkerById: (id: number) => MarkerData | undefined;
  deleteMarker: (id: number) => Promise<void>;
  getImagesForMarker: (markerId: number) => Promise<Image[]>;
  addImageToMarker: (markerId: number, imageUri: string) => Promise<void>;
}

const MarkersContext = createContext<MarkersContextType | undefined>(undefined);

export const MarkersProvider: React.FC = ({ children }) => {
  const [markers, setMarkers] = useState<MarkerCollection>([]);
  const [dbOperations, setDbOperations] = useState<DatabaseOperations | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize DB and DatabaseOperations instance once
  useEffect(() => {
    const initializeDb = async () => {
      try {
        const db = await initDatabase();
        const dbOpsInstance = new DatabaseOperations(db);
        setDbOperations(dbOpsInstance);
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initializeDb();
  }, []);

  // Fetch markers once dbOperations is ready
  useEffect(() => {
    if (!dbOperations) return;

    const fetchMarkers = async () => {
      try {
        const fetchedMarkers = await dbOperations.getMarkers();
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error('Error fetching markers:', error);
      }
    };

    fetchMarkers();
  }, [dbOperations]);

  const addMarker = async (marker: MarkerData): Promise<number | undefined> => {
  if (!dbOperations) {
    console.warn('Database not initialized yet');
    return undefined;
  }
  try {
    const newMarkerId = await dbOperations.addMarker(
      marker.latitude,
      marker.longitude,
      marker.title
    );
    const newMarkerWithId = { ...marker, id: newMarkerId };
    setMarkers((prevMarkers) => [...prevMarkers, newMarkerWithId]);
    return newMarkerId;
  } catch (error) {
    console.error('Error adding marker:', error);
    return undefined;
  }
};

  const getMarkerById = (id: number): MarkerData | undefined => {
    return markers.find((marker) => marker.id === id);
  };

  const deleteMarker = async (id: number) => {
    if (!dbOperations) {
      console.warn('Database not initialized yet');
      return;
    }
    try {
      // Delete images related to the marker first
      await dbOperations.deleteImagesByMarkerId(id);

      // Delete the marker itself
      await dbOperations.deleteMarker(id);

      // Update local state by removing the marker
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== id));

      console.log(`Deleted marker with ID: ${id} and its images`);
    } catch (error) {
      console.error('Error deleting marker and images:', error);
    }
  };

  const getImagesForMarker = async (markerId: number): Promise<Image[]> => {
    if (!dbOperations) {
      console.warn('Database not initialized yet');
      return [];
    }
    try {
      return await dbOperations.getMarkerImages(markerId);
    } catch (error) {
      console.error('Error fetching images for marker:', error);
      return [];
    }
  };

  const addImageToMarker = async (markerId: number, imageUri: string) => {
    if (!dbOperations) {
      console.warn('Database not initialized yet');
      return;
    }
    try {
      await dbOperations.addImage(markerId, imageUri);
      console.log(`Added image with URI: ${imageUri} to marker ID: ${markerId}`);
    } catch (error) {
      console.error('Error adding image to marker:', error);
    }
  };

  // Optionally, render null or loading while DB is initializing
  if (!isDbReady) {
    return null; // Or a loading spinner component
  }

  return (
    <MarkersContext.Provider
      value={{ markers, addMarker, getMarkerById, deleteMarker, getImagesForMarker, addImageToMarker }}
    >
      {children}
    </MarkersContext.Provider>
  );
};

export const useMarkers = (): MarkersContextType => {
  const context = useContext(MarkersContext);
  if (!context) {
    throw new Error('useMarkers must be used within a MarkersProvider');
  }
  return context;
};
