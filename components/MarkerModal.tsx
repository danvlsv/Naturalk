import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import ImagePickerComponent from './ImagePicker';
import { MarkerData } from '@/types';

interface MarkerModalProps {
  visible: boolean;
  marker: MarkerData;
  onSave: (marker: MarkerData) => void;
  onCancel: () => void;
}

export default function MarkerModal({ visible, marker, onSave, onCancel }: MarkerModalProps) {
  const [markerName, setMarkerName] = useState(marker.title);
  const [selectedImages, setSelectedImages] = useState<string[]>(marker.images || []);

  useEffect(() => {
    setMarkerName(marker.title);
    setSelectedImages(marker.images || []);
  }, [marker]);

  const handleSave = () => {
    if (!markerName.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название маркера');
      return;
    }
    onSave({ ...marker, title: markerName.trim(), images: selectedImages });
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        {/* Touchable overlay for dismissing modal */}
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onCancel(); }}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        {/* Modal content */}
        <View style={styles.modalContent}>
          {/* Fixed header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить маркер</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.formGroup, styles.firstFormGroup]}>
              <Text style={styles.label}>Название маркера</Text>
              <TextInput
                style={styles.input}
                onChangeText={setMarkerName}
                placeholder="Введите название"
                placeholderTextColor="#999"
                value={markerName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Координаты</Text>
              <Text style={styles.coordinates}>
                {marker.coordinate.latitude.toFixed(6)}, {marker.coordinate.longitude.toFixed(6)}
              </Text>
            </View>

            <ImagePickerComponent selectedImages={selectedImages} onChange={setSelectedImages} />
          </ScrollView>

          {/* Fixed footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#25292e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    height: '85%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  firstFormGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  coordinates: {
    fontSize: 14,
    color: '#ccc',
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#90BE6D',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
