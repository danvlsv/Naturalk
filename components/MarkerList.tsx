import { MarkerData } from '@/types';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MarkerListProps {
  markers: MarkerData[];
  onSelectMarker: (marker: MarkerData) => void;
}

export default function MarkerList({ markers, onSelectMarker }: MarkerListProps) {
  const renderItem = ({ item }: { item: MarkerData }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelectMarker(item)}>
      <Text style={styles.title}>{item.title || 'Без названия'}</Text>
      <Text style={styles.coords}>
        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={markers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.emptyText}>Нет маркеров для отображения</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#1a1d21',
    flexGrow: 1,
  },
  item: {
    backgroundColor: '#25292e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  coords: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});
