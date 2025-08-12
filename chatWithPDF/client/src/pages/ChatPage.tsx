import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BambooLogo } from "@/components/BambooLogo";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { FileManager } from "@/components/FileManager";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ArrowLeft, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useFileState } from "../hooks/useFileState";
import { apiService } from "../services/api";

export const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatType = location.pathname.includes("pdf") ? "pdf" : "video";
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { currentFile, saveFileState, clearFileState } = useFileState();
  const { getChatById } = useChatManager();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFileReady, setIsFileReady] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showFileManager, setShowFileManager] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const handleFileUpload = (file: File | null, fileData?: any) => {
    if (!file) {
      // Clear all state
      setUploadedFile(null);
      setCurrentFileId(null);
      setIsProcessing(false);
      setIsFileReady(false);
      clearFileState();
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }
    
    setUploadedFile(file);
    
    if (fileData) {
      // Save file state for persistence
      saveFileState({
        id: fileData.id,
        filename: fileData.filename,
        collectionName: fileData.collectionName,
        isIndexed: fileData.isIndexed,
        uploadedAt: fileData.uploadedAt
      });
      
      setCurrentFileId(fileData.id);
      
      // File should be indexed immediately now
      setIsProcessing(false);
      setIsFileReady(fileData.isIndexed);
      
      if (!fileData.isIndexed) {
        // If somehow not indexed, poll briefly
        pollForIndexing(fileData.id);
      }
    } else {
      setIsProcessing(true);
    }
  };

  const handleUploadComplete = () => {
    setIsProcessing(false);
    setIsFileReady(true);
  };
  
  const pollForIndexing = (fileId: string) => {
    console.log('Starting polling for file:', fileId);
    
    const checkStatus = async () => {
      try {
        const response = await apiService.getFileStatus(fileId);
        console.log('File status response:', response);
        
        if (response.success && response.file.isIndexed) {
          console.log('File is indexed, stopping polling');
          setIsProcessing(false);
          setIsFileReady(true);
          
          // Update saved file state
          if (currentFile && currentFile.id === fileId) {
            saveFileState({
              ...currentFile,
              isIndexed: true
            });
          }
          return true; // Stop polling
        }
        return false; // Continue polling
      } catch (error) {
        console.error('Error checking file status:', error);
        return true; // Stop polling on error
      }
    };
    
    // Initial check
    checkStatus().then(shouldStop => {
      if (shouldStop) return;
      
      // Continue polling every 2 seconds
      const interval = setInterval(async () => {
        const shouldStop = await checkStatus();
        if (shouldStop) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 2000);
      
      setPollingInterval(interval);
      
      // Stop after 2 minutes max
      setTimeout(() => {
        clearInterval(interval);
        setPollingInterval(null);
        console.log('Polling timeout reached');
      }, 120000);
    });
  };
  
  const handleFileSelect = (fileData: any) => {
    console.log('Selected file data:', fileData);
    // Create a mock File object for display purposes
    const mockFile = new File([''], fileData.filename, { type: 'application/pdf' });
    setUploadedFile(mockFile);
    setCurrentFileId(fileData.id);
    setIsFileReady(fileData.isIndexed);
    setIsProcessing(!fileData.isIndexed);
    setShowFileManager(false);
    
    // Update the saved file state with the selected file
    saveFileState({
      id: fileData.id,
      filename: fileData.filename,
      collectionName: fileData.collectionName,
      isIndexed: fileData.isIndexed,
      uploadedAt: fileData.uploadedAt
    });
    
    if (!fileData.isIndexed) {
      pollForIndexing(fileData.id);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    try {
      // Get the chat information
      const selectedChat = getChatById(chatId);
      if (!selectedChat) {
        console.error('Chat not found:', chatId);
        return;
      }

      console.log('Loading chat:', selectedChat);
      
      // Load the file associated with this chat
      const fileData = {
        id: selectedChat.fileId,
        filename: selectedChat.fileName,
        collectionName: selectedChat.collectionName,
        isIndexed: true, // Assume indexed since chat exists
        uploadedAt: selectedChat.createdAt
      };
      
      // Create a mock File object for display purposes
      const mockFile = new File([''], selectedChat.fileName, { type: 'application/pdf' });
      setUploadedFile(mockFile);
      setCurrentFileId(selectedChat.fileId);
      setIsFileReady(true);
      setIsProcessing(false);
      
      // Update the saved file state with the selected file
      saveFileState(fileData);
      
      // Verify file status from backend
      try {
        const response = await apiService.getFileStatus(selectedChat.fileId);
        if (response.success) {
          setIsFileReady(response.file.isIndexed);
          setIsProcessing(!response.file.isIndexed);
        }
      } catch (error) {
        console.warn('Could not verify file status:', error);
        // Continue with assumed values
      }
      
      console.log('Chat and file loaded successfully');
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };
  
  const checkFileStatus = async () => {
    if (!currentFileId) return;
    
    try {
      const response = await apiService.getFileStatus(currentFileId);
      console.log('Manual status check:', response);
      
      if (response.success) {
        setIsFileReady(response.file.isIndexed);
        setIsProcessing(!response.file.isIndexed);
        
        if (response.file.isIndexed && currentFile) {
          saveFileState({
            ...currentFile,
            isIndexed: true
          });
        }
      }
    } catch (error) {
      console.error('Error checking file status manually:', error);
    }
  };
  
  // Load current file state on mount
  useEffect(() => {
    if (currentFile && chatType === 'pdf') {
      const mockFile = new File([''], currentFile.filename, { type: 'application/pdf' });
      setUploadedFile(mockFile);
      setCurrentFileId(currentFile.id);
      setIsFileReady(currentFile.isIndexed);
      setIsProcessing(!currentFile.isIndexed);
      
      if (!currentFile.isIndexed) {
        pollForIndexing(currentFile.id);
      }
    }
  }, [currentFile, chatType]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const pageTitle = chatType === "pdf" ? "Talk with PDF files" : "Talk with Videos";
  const pageDescription = chatType === "pdf" 
    ? "Upload a PDF and start asking questions about its content"
    : "Upload a video and get insights through AI-powered conversations";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-bamboo-border bg-bamboo-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <BambooLogo size="md" showText={true} />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-4">
                Welcome, {user?.name}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-[calc(100vh-180px)] gap-0 max-w-full overflow-hidden">
          {/* Chat Sidebar */}
          <div className="flex-shrink-0">
            <ChatSidebar 
              onNewChat={() => setShowFileManager(true)} 
              onChatSelect={handleChatSelect}
            />
          </div>
          
          {/* File Upload & Settings Panel - Narrower on desktop */}
          <div className="w-72 flex-shrink-0 border-r border-border bg-background p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold">
                    {uploadedFile ? "Current File" : `Upload ${chatType.toUpperCase()}`}
                  </h2>
                  {chatType === 'pdf' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFileManager(!showFileManager)}
                      className="text-bamboo-pink border-bamboo-pink hover:bg-bamboo-pink hover:text-white text-xs"
                    >
                      {showFileManager ? 'Hide' : 'Files'}
                    </Button>
                  )}
                </div>
                
                {showFileManager && chatType === 'pdf' ? (
                  <FileManager onFileSelect={handleFileSelect} />
                ) : (
                  <div className="space-y-3">
                    <FileUpload
                      type={chatType}
                      onFileUpload={handleFileUpload}
                      uploadedFile={uploadedFile}
                      isProcessing={isProcessing}
                      onUploadComplete={handleUploadComplete}
                    />
                    {uploadedFile && isProcessing && currentFileId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkFileStatus}
                        className="w-full"
                      >
                        Check Status
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <ApiKeySettings
                onApiKeySet={setApiKey}
                currentApiKey={apiKey}
              />
            </div>
          </div>

          {/* Chat Interface - Takes maximum remaining space */}
          <div className="flex-1 min-w-0">
            <ChatInterface
              fileContext={uploadedFile}
              fileType={chatType}
              isFileReady={isFileReady}
              collectionName={currentFile?.collectionName || uploadedFile?.name}
              fileId={currentFile?.id}
              fileName={currentFile?.filename || uploadedFile?.name}
            />
          </div>
        </div>
        
        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          {/* Mobile Sidebar */}
          <div className="bg-background border border-border rounded-lg">
            <ChatSidebar 
              onNewChat={() => setShowFileManager(true)} 
              onChatSelect={handleChatSelect}
            />
          </div>
          
          {/* File Upload & Settings */}
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {uploadedFile ? "Current File" : `Upload ${chatType.toUpperCase()}`}
                  </h2>
                  {chatType === 'pdf' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFileManager(!showFileManager)}
                      className="text-bamboo-pink border-bamboo-pink hover:bg-bamboo-pink hover:text-white"
                    >
                      {showFileManager ? 'Hide Files' : 'My Files'}
                    </Button>
                  )}
                </div>
                
                {showFileManager && chatType === 'pdf' ? (
                  <FileManager onFileSelect={handleFileSelect} />
                ) : (
                  <div className="space-y-4">
                    <FileUpload
                      type={chatType}
                      onFileUpload={handleFileUpload}
                      uploadedFile={uploadedFile}
                      isProcessing={isProcessing}
                      onUploadComplete={handleUploadComplete}
                    />
                    {uploadedFile && isProcessing && currentFileId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkFileStatus}
                        className="w-full"
                      >
                        Check Status
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <ApiKeySettings
                onApiKeySet={setApiKey}
                currentApiKey={apiKey}
              />
            </div>
          </div>
          
          {/* Mobile Chat Interface */}
          <div className="h-[60vh]">
            <ChatInterface
              fileContext={uploadedFile}
              fileType={chatType}
              isFileReady={isFileReady}
              collectionName={currentFile?.collectionName || uploadedFile?.name}
              fileId={currentFile?.id}
              fileName={currentFile?.filename || uploadedFile?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};