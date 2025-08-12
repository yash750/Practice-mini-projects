import { useState, useEffect } from 'react';
import { apiService, UserFile } from '../services/api';

interface FileState {
  id: string;
  filename: string;
  collectionName: string;
  isIndexed: boolean;
  uploadedAt: string;
  size?: number;
}

export const useFileState = () => {
  const [currentFile, setCurrentFile] = useState<FileState | null>(null);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load file state from localStorage on mount
  useEffect(() => {
    const savedFile = localStorage.getItem('currentPdfFile');
    if (savedFile) {
      try {
        setCurrentFile(JSON.parse(savedFile));
      } catch (error) {
        console.error('Error parsing saved file state:', error);
        localStorage.removeItem('currentPdfFile');
      }
    }
  }, []);

  // Load user files
  const loadUserFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserFiles();
      if (response.success) {
        setUserFiles(response.files);
      }
    } catch (error) {
      console.error('Error loading user files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save file state to localStorage
  const saveFileState = (fileData: FileState) => {
    setCurrentFile(fileData);
    localStorage.setItem('currentPdfFile', JSON.stringify(fileData));
  };

  // Clear file state
  const clearFileState = () => {
    setCurrentFile(null);
    localStorage.removeItem('currentPdfFile');
  };

  // Select existing file
  const selectFile = (file: UserFile) => {
    const fileState: FileState = {
      id: file._id,
      filename: file.originalName,
      collectionName: file.collectionName,
      isIndexed: file.isIndexed,
      uploadedAt: file.createdAt,
      size: file.fileSize
    };
    saveFileState(fileState);
  };

  // Delete file
  const deleteFile = async (fileId: string) => {
    try {
      await apiService.deleteFile(fileId);
      setUserFiles(prev => prev.filter(f => f._id !== fileId));
      
      // Clear current file if it's the one being deleted
      if (currentFile?.id === fileId) {
        clearFileState();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  };

  return {
    currentFile,
    userFiles,
    isLoading,
    saveFileState,
    clearFileState,
    selectFile,
    loadUserFiles,
    deleteFile
  };
};