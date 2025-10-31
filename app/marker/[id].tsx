import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ImageList from '@/components/ImageList';
import { MarkerDetailsParams } from '@/types';
import { useMarkers } from '@/contexts/MarkersContext';

export default function MarkerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<MarkerDetailsParams>();
  const { getMarkerById, deleteMarker } = useMarkers();

  const markerData = getMarkerById(id as string);

  const handleDelete = () => {
    if (!markerData) return;

    Alert.alert(
      'Удалить маркер',
      'Вы уверены, что хотите удалить этот маркер?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteMarker(markerData.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!markerData) return;
    // TODO: Navigate to edit screen
    console.log('Edit marker:', markerData.id);
  };

  if (!markerData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backText}>Назад</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Детали маркера</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Маркер не найден</Text>
        </View>
      </View>
    );
  }

  const formattedDate = markerData.createdAt.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Детали маркера</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {markerData.images && markerData.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Фотографии</Text>
            <ImageList images={markerData.images} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Название</Text>
          <Text style={styles.titleText}>{markerData.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Координаты</Text>
          <View style={styles.coordinateRow}>
            <MaterialIcons name="place" size={20} color="#666" />
            <Text style={styles.coordinateText}>
              Широта: {markerData.coordinate.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.coordinateRow}>
            <MaterialIcons name="place" size={20} color="#666" />
            <Text style={styles.coordinateText}>
              Долгота: {markerData.coordinate.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {markerData.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.descriptionText}>{markerData.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дата создания</Text>
          <View style={styles.dateRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <MaterialIcons name="edit" size={20} color="#007AFF" />
            <Text style={styles.editButtonText}>Редактировать</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordinateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  idText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
