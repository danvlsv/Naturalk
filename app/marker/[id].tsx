import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImageList from '@/components/ImageList';
import { MarkerDetailsParams } from '@/types';
import { useMarkers } from '@/contexts/MarkersContext';

const { width, height } = Dimensions.get('window');

export default function MarkerDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<MarkerDetailsParams>();
  const { getMarkerById, deleteMarker, updateMarker } = useMarkers();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const markerData = getMarkerById(id as string);

  const handleAddImage = async () => {
    if (!markerData) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const updatedImages = [...markerData.images, result.assets[0].uri];
      updateMarker({ ...markerData, images: updatedImages });
    }
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  const handleDeleteImage = () => {
    if (!markerData || selectedImageIndex === null) return;

    Alert.alert(
      'Удалить фото',
      'Вы уверены, что хотите удалить это фото?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const updatedImages = markerData.images.filter((_, index) => index !== selectedImageIndex);
            updateMarker({ ...markerData, images: updatedImages });
            setImageViewerVisible(false);
            setSelectedImageIndex(null);
          },
        },
      ]
    );
  };

  const handleNextImage = () => {
    if (!markerData || selectedImageIndex === null) return;
    const nextIndex = (selectedImageIndex + 1) % markerData.images.length;
    setSelectedImageIndex(nextIndex);
  };

  const handlePreviousImage = () => {
    if (!markerData || selectedImageIndex === null) return;
    const prevIndex = selectedImageIndex === 0
      ? markerData.images.length - 1
      : selectedImageIndex - 1;
    setSelectedImageIndex(prevIndex);
  };

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
    console.log('Edit marker:', markerData.id);
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
          <MaterialIcons name="arrow-back" size={24} color='#90BE6D' />
          <Text style={styles.backText}>Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Детали маркера</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Фотографии ({markerData.images?.length || 0})
            </Text>
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <MaterialIcons name="add-photo-alternate" size={20} color="#90BE6D" />
              <Text style={styles.addImageText}>Добавить</Text>
            </TouchableOpacity>
          </View>

          {markerData.images && markerData.images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imageGrid}>
                {markerData.images.map((imageUri, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImagePress(index)}
                    style={styles.imageWrapper}
                  >
                    <Image source={{ uri: imageUri }} style={styles.thumbnail} />
                  </TouchableOpacity>
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
            <Text style={styles.coordinateText}>
              Широта: {markerData.coordinate.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.coordinateRow}>
            <MaterialIcons name="place" size={20} color="#ccc" />
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

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.imageCounter}>
              {selectedImageIndex !== null && markerData
                ? `${selectedImageIndex + 1} / ${markerData.images.length}`
                : ''}
            </Text>
            <TouchableOpacity
              onPress={handleDeleteImage}
              style={styles.deleteImageButton}
            >
              <MaterialIcons name="delete" size={30} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {selectedImageIndex !== null && markerData && (
            <>
              <Image
                source={{ uri: markerData.images[selectedImageIndex] }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />

              {markerData.images.length > 1 && (
                <>
                  <TouchableOpacity
                    onPress={handlePreviousImage}
                    style={[styles.navButton, styles.navButtonLeft]}
                  >
                    <MaterialIcons name="chevron-left" size={40} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNextImage}
                    style={[styles.navButton, styles.navButtonRight]}
                  >
                    <MaterialIcons name="chevron-right" size={40} color="#FFF" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d21',
  },
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 17,
    color: '#90BE6D',
    marginLeft: 5,
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
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
  addImageText: {
    fontSize: 14,
    color: '#90BE6D',
    fontWeight: '600',
  },
  emptyImagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyImagesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coordinateText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: width,
    height: height,
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
