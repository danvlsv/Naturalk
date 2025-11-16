import { useMarkers } from '@/contexts/MarkersContext';
import { MarkerDetailsParams } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import ImageView from 'react-native-image-viewing';

const { width, height } = Dimensions.get('window');

export default function MarkerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<MarkerDetailsParams>();
  const { getMarkerById, deleteMarker, getImagesForMarker, addImageToMarker, deleteImage } = useMarkers();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [images, setImages] = useState<{ id: number; uri: string }[]>([]);

  const markerData = getMarkerById(Number(id));

  useEffect(() => {
  if (markerData) {
    getImagesForMarker(markerData.id)
      .then(setImages)
      .catch(() => setImages([]));
  } else {
    setImages([]);
  }
}, [markerData]);

  const handleAddImage = async () => {
    if (!markerData) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        await addImageToMarker(markerData.id, result.assets[0].uri);
        const updatedImages = await getImagesForMarker(markerData.id);
        setImages(updatedImages);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось добавить изображение');
      }
    }
  };

  const handleDeleteImage = () => {
  if (!markerData || images.length === 0 || selectedImageIndex === null) return;

  const imageToDelete = images[selectedImageIndex];

  Alert.alert(
    'Удалить фото',
    'Вы уверены, что хотите удалить это фото?',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteImage(imageToDelete.id);
            const refreshedImages = await getImagesForMarker(markerData.id);
            setImages(refreshedImages);
            setImageViewerVisible(false);
            setSelectedImageIndex(null);
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось удалить изображение');
          }
        },
      },
    ]
  );
};

  const handleDelete = () => {
    if (!markerData) return;

    Alert.alert('Удалить маркер', 'Вы уверены, что хотите удалить этот маркер?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteMarker(markerData.id);
          router.back();
        },
      },
    ]);
  };

  if (!markerData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#90BE6D" />
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

  // FIX: can't get createdAt
  const createdAtDate = markerData.createdAt ? new Date(markerData.createdAt) : null;
  const formattedDate = createdAtDate
    ? createdAtDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Дата не указана';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#90BE6D" />
          <Text style={styles.backText}>Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Детали маркера</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Фотографии ({images.length})</Text>
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <MaterialIcons name="add-photo-alternate" size={20} color="#90BE6D" />
              <Text style={styles.addImageText}>Добавить</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageGrid}>
                {images.map((image, index) => (
                  <View key={image.id} style={styles.imageWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedImageIndex(index);
                        setImageViewerVisible(true);
                      }}
                    >
                      <Image source={{ uri: image.uri }} style={styles.thumbnail} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIconContainer}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        handleDeleteImage();
                      }}
                    >
                      <MaterialIcons name="delete" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
            ) : (
            <View style={styles.emptyImagesContainer}>
              <MaterialIcons name="photo-library" size={48} color="#666" />
              <Text style={styles.emptyImagesText}>Нет фотографий</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Название</Text>
          <Text style={styles.titleText}>{markerData.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Координаты</Text>
          <View style={styles.coordinateRow}>
            <MaterialIcons name="place" size={20} color="#ccc" />
            <Text style={styles.coordinateText}>Широта: {markerData.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.coordinateRow}>
            <MaterialIcons name="place" size={20} color="#ccc" />
            <Text style={styles.coordinateText}>Долгота: {markerData.longitude.toFixed(6)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дата создания</Text>
          <View style={styles.dateRow}>
            <MaterialIcons name="access-time" size={20} color="#ccc" />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ImageView
        images={images.map((img) => ({ uri: img.uri }))}
        imageIndex={selectedImageIndex ?? 0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1d21' },
  header: {
    backgroundColor: '#25292e',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 17, color: '#90BE6D', marginLeft: 5 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 'auto',
    marginRight: 'auto',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#ccc' },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    backgroundColor: '#25292e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    textTransform: 'uppercase',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#444',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#90BE6D',
  },
  addImageText: { fontSize: 14, color: '#90BE6D', fontWeight: '600' },
  emptyImagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyImagesText: { fontSize: 14, color: '#666', marginTop: 8 },
  imageGrid: { flexDirection: 'row', gap: 10 },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  thumbnail: { width: 120, height: 120, borderRadius: 8 },
  titleText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  coordinateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coordinateText: { fontSize: 16, color: '#fff', marginLeft: 8 },
  descriptionText: { fontSize: 16, color: '#fff', lineHeight: 24 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#fff', marginLeft: 8 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: { backgroundColor: '#444', borderWidth: 1, borderColor: '#FF3B30' },
  deleteButtonText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
    backgroundColor: 'rgba(37, 41, 46, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  deleteImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width,
    height,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    backgroundColor: '#333',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});
