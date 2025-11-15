import { Image, MarkerData } from '@/types';
import * as SQLite from 'expo-sqlite';

export class DatabaseOperations {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async addMarker(latitude: number, longitude: number, title: string): Promise<number> {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO markers (latitude, longitude, title) VALUES (?, ?, ?)',
        [latitude, longitude, title]
      );

      if (!result.lastInsertRowId) {
        throw new Error('Failed to insert marker');
      }

      return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding marker:', error);
        throw new Error(`Failed to add marker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMarker(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting marker:', error);
      throw new Error(`Failed to delete marker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarkers(): Promise<MarkerData[]> {
    try {
      const markers = await this.db.getAllAsync<MarkerData>(
        'SELECT * FROM markers ORDER BY created_at DESC'
      );
      return markers || [];
    } catch (error) {
      console.error('Error fetching markers:', error);
      throw new Error(`Failed to fetch markers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarkerById(id: number): Promise<MarkerData | null> {
    try {
      const marker = await this.db.getFirstAsync<MarkerData>(
        'SELECT * FROM markers WHERE id = ?',
        [id]
      );
      return marker || null;
    } catch (error) {
      console.error('Error fetching marker:', error);
      throw new Error(`Failed to fetch marker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addImage(markerId: number, uri: string): Promise<number> {
    try {
      const marker = await this.getMarkerById(markerId);
      if (!marker) {
        throw new Error(`Marker with id ${markerId} not found`);
      }

      const result = await this.db.runAsync(
        'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)',
        [markerId, uri]
      );

      if (!result.lastInsertRowId) {
        throw new Error('Failed to insert image');
      }

      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding image:', error);
      throw new Error(`Failed to add image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImage(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMarkerImages(markerId: number): Promise<Image[]> {
    try {
      const images = await this.db.getAllAsync<Image>(
        'SELECT * FROM marker_images WHERE marker_id = ? ORDER BY created_at DESC',
        [markerId]
      );
      return images || [];
    } catch (error) {
      console.error('Error fetching marker images:', error);
      throw new Error(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImagesByMarkerId(markerId: number): Promise<void> {
    try {
      await this.db.runAsync(
        'DELETE FROM marker_images WHERE marker_id = ?',
        [markerId]
      );
    } catch (error) {
      console.error('Error deleting marker images:', error);
      throw new Error(`Failed to delete marker images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}