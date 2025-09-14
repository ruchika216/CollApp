import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { 
  pick,
  DocumentPickerResponse, 
  types 
} from '@react-native-documents/picker';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useTheme, SPACING, BORDER_RADIUS } from '../../theme';
import Icon from './Icon';
import Card from './Card';

interface FileItem {
  name: string;
  uri: string;
  type: string;
  size?: number;
}

interface FileUploadProps {
  onFilesSelected: (files: FileItem[]) => void;
  onImagesSelected: (images: FileItem[]) => void;
  maxFiles?: number;
  maxImages?: number;
  allowedFileTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onImagesSelected,
  maxFiles = 10,
  maxImages = 5,
  allowedFileTypes = ['pdf', 'doc', 'docx', 'txt', 'zip'],
}) => {
  const { colors } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<FileItem[]>([]);

  const pickDocument = async () => {
    try {
      const results = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });

      const newFiles = results.map((result: DocumentPickerResponse) => ({
        name: result.name || 'Unknown file',
        uri: result.uri,
        type: result.type || 'application/octet-stream',
        size: result.size,
      }));

      if (selectedFiles.length + newFiles.length > maxFiles) {
        Alert.alert('Error', `You can only upload up to ${maxFiles} files`);
        return;
      }

      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    } catch (err: any) {
      // Check if the error is due to user cancellation
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        includeBase64: false,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          if (response.errorMessage && response.errorMessage !== 'User cancelled image selection') {
            Alert.alert('Error', 'Failed to take photo');
          }
          return;
        }
        
        if (response.assets && response.assets[0]) {
          addImage(response.assets[0]);
        }
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        includeBase64: false,
        selectionLimit: maxImages - selectedImages.length,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          if (response.errorMessage && response.errorMessage !== 'User cancelled image selection') {
            Alert.alert('Error', 'Failed to select images');
          }
          return;
        }
        
        if (response.assets) {
          response.assets.forEach(addImage);
        }
      }
    );
  };

  const addImage = (image: any) => {
    if (selectedImages.length >= maxImages) {
      Alert.alert('Error', `You can only upload up to ${maxImages} images`);
      return;
    }

    const newImage: FileItem = {
      name: image.filename || `image_${Date.now()}.jpg`,
      uri: image.path,
      type: image.mime,
      size: image.size,
    };

    const updatedImages = [...selectedImages, newImage];
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'file';
    if (type.includes('doc')) return 'file';
    if (type.includes('text')) return 'file';
    if (type.includes('zip') || type.includes('rar')) return 'file';
    return 'file';
  };

  return (
    <View style={styles.container}>
      {/* Upload Buttons */}
      <View style={styles.uploadButtons}>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.primary }]}
          onPress={pickDocument}
        >
          <Icon name="file" size={24} tintColor="#fff" />
          <Text style={styles.uploadButtonText}>Upload Files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.secondary }]}
          onPress={pickImage}
        >
          <Icon name="add" size={24} tintColor="#fff" />
          <Text style={styles.uploadButtonText}>Add Images</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Files ({selectedFiles.length}/{maxFiles})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.fileList}>
              {selectedFiles.map((file, index) => (
                <Card key={index} style={styles.fileItem} variant="outlined">
                  <View style={styles.fileHeader}>
                    <Icon 
                      name={getFileIcon(file.type)} 
                      size={20} 
                      tintColor={colors.primary} 
                    />
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={styles.removeButton}
                    >
                      <Icon name="close" size={16} tintColor={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text 
                    style={[styles.fileName, { color: colors.text }]} 
                    numberOfLines={2}
                  >
                    {file.name}
                  </Text>
                  {file.size && (
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatFileSize(file.size)}
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Images ({selectedImages.length}/{maxImages})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageList}>
              {selectedImages.map((image, index) => (
                <Card key={index} style={styles.imageItem} variant="outlined">
                  <View style={styles.imageHeader}>
                    <Icon name="add" size={20} tintColor={colors.secondary} />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={styles.removeButton}
                    >
                      <Icon name="close" size={16} tintColor={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text 
                    style={[styles.fileName, { color: colors.text }]} 
                    numberOfLines={2}
                  >
                    {image.name}
                  </Text>
                  {image.size && (
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatFileSize(image.size)}
                    </Text>
                  )}
                </Card>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Upload Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.surfaceVariant }]}>
        <Icon name="info" size={20} tintColor={colors.info} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          You can upload up to {maxFiles} files and {maxImages} images. 
          Supported file formats: {allowedFileTypes.join(', ').toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  fileList: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  imageList: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  fileItem: {
    width: 140,
    padding: SPACING.md,
  },
  imageItem: {
    width: 140,
    padding: SPACING.md,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  fileSize: {
    fontSize: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default FileUpload;