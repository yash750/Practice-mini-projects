import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BambooLogo } from "@/components/BambooLogo";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { ArrowLeft, User, LogOut } from "lucide-react";

// BACKEND INTEGRATION COMMENT:
// This page will need to:
// 1. Check user authentication status
// 2. Redirect to login if not authenticated
// 3. Load user's previous chat sessions
// 4. Handle file processing and storage
// 5. Manage user session and logout functionality

export const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatType = location.pathname.includes("pdf") ? "pdf" : "video";
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    
    try {
      // BACKEND INTEGRATION: Process the uploaded file
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch(`/api/files/upload/${chatType}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: formData
      // });
      // const data = await response.json();
      // if (data.success) {
      //   // File processed successfully
      // }
      
      // Simulated processing for demo
      setTimeout(() => {
        setIsProcessing(false);
        console.log(`${chatType.toUpperCase()} file processed:`, file.name);
      }, 3000);
    } catch (error) {
      console.error("Error processing file:", error);
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    // BACKEND INTEGRATION: Clear user session
    // localStorage.removeItem('token');
    // Call logout endpoint if needed
    navigate("/");
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
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & Settings */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {uploadedFile ? "Uploaded File" : `Upload ${chatType.toUpperCase()}`}
              </h2>
              <FileUpload
                type={chatType}
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isProcessing={isProcessing}
              />
            </div>

            <ApiKeySettings
              onApiKeySet={setApiKey}
              currentApiKey={apiKey}
            />
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface
              fileContext={uploadedFile}
              fileType={chatType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};