import React, { useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Region, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import MarkerModal from './MarkerModal';
import { MarkerData } from '@/types';
import { useMarkers } from '@/contexts/MarkersContext';

interface MapContainerProps {
  initialRegion?: Region;
}

export default function MapContainer({ initialRegion }: MapContainerProps) {
  const router = useRouter();
  const { markers, addMarker } = useMarkers();

  const defaultRegion: Region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [currentMarker, setCurrentMarker] = useState<MarkerData | null>(null);

  const handleLongPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    const newMarker: MarkerData = {
      id: `marker_${Date.now()}`,
      coordinate,
      title: 'Новый маркер',
      description: '',
      images: [],
      createdAt: new Date(),
    };
    setCurrentMarker(newMarker);
    setModalVisible(true);
  };

  const handleMarkerPress = (marker: MarkerData) => {
    router.push(`/marker/${marker.id}`);
  };

  const onSaveMarker = (updatedMarker: MarkerData) => {
    addMarker(updatedMarker);
    setModalVisible(false);
    setCurrentMarker(null);
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
            coordinate={marker.coordinate}

            description={marker.description}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      {modalVisible && currentMarker && (
        <MarkerModal
          visible={modalVisible}
          marker={currentMarker}
          onSave={onSaveMarker}
          onCancel={onCancelMarker}
        />
      )}
    </View>
  );
}
