import storage from '@react-native-firebase/storage';
import { ProjectFile } from '../types';

export interface UploadFileParams {
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  projectId: string;
  userId: string;
}

export interface UploadProgressCallback {
  (bytesTransferred: number, totalBytes: number): void;
}

/**
 * Upload a file to Firebase Storage
 */
export const uploadFileToStorage = async (
  params: UploadFileParams,
  onProgress?: UploadProgressCallback
): Promise<ProjectFile> => {
  const { filePath, fileName, fileType, fileSize, projectId, userId } = params;
  
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop() || 'unknown';
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Create storage reference
    const storageRef = storage().ref(`projects/${projectId}/files/${uniqueFileName}`);
    
    // Upload file
    const uploadTask = storageRef.putFile(filePath);
    
    // Monitor upload progress
    if (onProgress) {
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(snapshot.bytesTransferred, snapshot.totalBytes);
        console.log(`Upload is ${progress.toFixed(2)}% done`);
      });
    }
    
    // Wait for upload to complete
    await uploadTask;
    
    // Get download URL
    const downloadURL = await storageRef.getDownloadURL();
    
    // Create file metadata
    const projectFile: ProjectFile = {
      id: `file_${timestamp}`,
      name: fileName,
      url: downloadURL,
      type: fileType,
      size: fileSize,
      uploadedAt: new Date().toISOString(),
    };
    
    console.log('File uploaded successfully:', projectFile);
    return projectFile;
    
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = storage().refFromURL(fileUrl);
    await fileRef.delete();
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file metadata from storage
 */
export const getFileMetadata = async (fileUrl: string) => {
  try {
    const fileRef = storage().refFromURL(fileUrl);
    const metadata = await fileRef.getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
};

/**
 * Generate a presigned URL for file access (for private files)
 */
export const getFileDownloadURL = async (filePath: string): Promise<string> => {
  try {
    const fileRef = storage().ref(filePath);
    const downloadURL = await fileRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw new Error('Failed to get download URL');
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
  files: UploadFileParams[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<ProjectFile[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadFileToStorage(file, (bytesTransferred, totalBytes) => {
      if (onProgress) {
        const progress = (bytesTransferred / totalBytes) * 100;
        onProgress(index, progress);
      }
    })
  );
  
  try {
    const uploadedFiles = await Promise.all(uploadPromises);
    return uploadedFiles;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Failed to upload some files');
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (
  fileName: string, 
  fileSize: number, 
  maxSizeInMB: number = 10
): { isValid: boolean; error?: string } => {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (fileSize > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit`
    };
  }
  
  // Check file type (you can customize this based on your needs)
  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', // Images
    'pdf', 'doc', 'docx', 'txt', 'rtf', // Documents
    'xls', 'xlsx', 'csv', // Spreadsheets
    'ppt', 'pptx', // Presentations
    'zip', 'rar', '7z', // Archives
    'mp4', 'avi', 'mov', 'wmv', // Videos
    'mp3', 'wav', 'aac', // Audio
  ];
  
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }
  
  return { isValid: true };
};

export default {
  uploadFileToStorage,
  deleteFileFromStorage,
  getFileMetadata,
  getFileDownloadURL,
  uploadMultipleFiles,
  validateFile,
};