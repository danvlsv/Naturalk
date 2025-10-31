import React from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions } from 'react-native';

interface ImageListProps {
  images: string[];
}

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3; // 3 изображения в ряд с отступами

export default function ImageList({ images }: ImageListProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {images.map((imageUri, index) => (
        <Image
          key={index}
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
  },
});
