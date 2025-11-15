import { useMarkers } from '@/contexts/MarkersContext';
import { MarkerData } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MarkerModal from './MarkerModal';

interface MapContainerProps {
  initialRegion?: Region;
}

export default function MapContainer({ initialRegion }: MapContainerProps) {
  const router = useRouter();
  const { markers, addMarker, addImageToMarker } = useMarkers();

  const defaultRegion: Region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [currentMarker, setCurrentMarker] = useState<MarkerData | null>(null);
  const [currentImages, setCurrentImages] = useState<{ uri: string }[]>([]);

  const handleLongPress = (event: MapPressEvent) => {
  const { coordinate } = event.nativeEvent;
  const newMarker: MarkerData = {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    title: 'Новый маркер',
  };
  setCurrentMarker(newMarker);
  setCurrentImages([]); // reset image list for new marker
  setModalVisible(true);
};

  const handleMarkerPress = (marker: Marker) => {
    router.push(`/marker/${marker.id}`);
  };

  const onSaveMarker = async (updatedMarker: MarkerData, images: { uri: string }[]) => {
  if (!updatedMarker.title?.trim()) {
    // Optional: validation before saving
    return;
  }

  try {
    // Add marker to DB, get new marker id
    const newMarkerId = await addMarker(updatedMarker);

    // Add all images to marker by new id

    if (images && images.length > 0) {
      for (const image of images) {
        await addImageToMarker(newMarkerId, image.uri);
      }
    }

    // Optionally reload markers here or rely on existing logic

  } catch (error) {
    console.error('Error saving marker or images:', error);
  } finally {
    setModalVisible(false);
    setCurrentMarker(null);
    setCurrentImages([]);
  }
};
  const onCancelMarker = () => {
    setModalVisible(false);
    setCurrentMarker(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion || defaultRegion}
        onLongPress={handleLongPress}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      {modalVisible && currentMarker && (
        <MarkerModal
          visible={modalVisible}
          marker={currentMarker}
          images={currentImages}
          onChangeImages={setCurrentImages}
          onSave={onSaveMarker}
          onCancel={onCancelMarker}
        />
      )}
    </View>
  );
}
