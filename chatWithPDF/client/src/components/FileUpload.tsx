import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, Video, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Upload files to cloud storage (AWS S3, Google Cloud, etc.)
// 2. Process uploaded files (PDF parsing, video transcription)
// 3. Show upload progress with real progress bars
// 4. Validate file types and sizes on backend
// 5. Generate file previews/thumbnails

interface FileUploadProps {
  type: "pdf" | "video";
  onFileUpload: (file: File) => void;
  uploadedFile?: File | null;
  isProcessing?: boolean;
}

export const FileUpload = ({ type, onFileUpload, uploadedFile, isProcessing }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === "pdf" ? ".pdf" : ".mp4,.avi,.mov,.wmv,.webm";
  const Icon = type === "pdf" ? FileText : Video;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const maxSize = type === "pdf" ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for PDF, 100MB for video
    
    if (file.size > maxSize) {
      alert(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return false;
    }
    
    if (type === "pdf" && !file.type.includes("pdf")) {
      alert("Please upload a PDF file");
      return false;
    }
    
    if (type === "video" && !file.type.includes("video")) {
      alert("Please upload a video file");
      return false;
    }
    
    return true;
  };

  const clearFile = () => {
    // BACKEND INTEGRATION: Also clear from server if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Reset the uploaded file state in parent component
  };

  if (uploadedFile) {
    return (
      <Card className="bg-bamboo-card border-bamboo-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isProcessing ? (
                <div className="flex items-center gap-2 text-bamboo-pink">
                  <div className="animate-spin h-4 w-4 border-2 border-bamboo-pink border-t-transparent rounded-full" />
                  <span className="text-sm">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Ready</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "bg-bamboo-card border-bamboo-border border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-bamboo-pink/50",
        isDragOver && "border-bamboo-pink bg-bamboo-pink/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <CardContent className="p-12 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <Icon className="h-8 w-8 text-muted-foreground mx-auto" />
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            Drop your {type.toUpperCase()} file here
          </p>
          <p className="text-muted-foreground">
            or click to browse files
          </p>
          <p className="text-sm text-muted-foreground">
            Maximum file size: {type === "pdf" ? "10MB" : "100MB"}
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};