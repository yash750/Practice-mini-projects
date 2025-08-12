import { useState, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, Video, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "../services/api";
import { useToast } from "./ui/use-toast";

interface FileUploadProps {
  type: "pdf" | "video";
  onFileUpload: (file: File | null, fileData?: any) => void;
  uploadedFile?: File | null;
  isProcessing?: boolean;
  onUploadComplete?: () => void;
  onClearFile?: () => void;
}

export const FileUpload = ({ type, onFileUpload, uploadedFile, isProcessing, onUploadComplete }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        uploadFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        uploadFile(file);
      }
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      let response;
      if (type === 'pdf') {
        response = await apiService.uploadPDF(file);
      } else {
        response = await apiService.uploadVideo(file);
      }
      
      // Pass file data to parent if available
      if (response.fileData) {
        onFileUpload(file, response.fileData);
      } else {
        onFileUpload(file);
      }
      
      onUploadComplete?.();
      
      toast({
        title: "Success",
        description: response.message || `${type.toUpperCase()} file uploaded successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const validateFile = (file: File) => {
    const maxSize = type === "pdf" ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return false;
    }
    
    if (type === "pdf" && !file.type.includes("pdf")) {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return false;
    }
    
    if (type === "video" && !file.type.includes("video")) {
      toast({
        title: "Error",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Call parent to clear state
    onFileUpload(null as any);
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
              {isProcessing || isUploading ? (
                <div className="flex items-center gap-2 text-bamboo-pink">
                  <div className="animate-spin h-4 w-4 border-2 border-bamboo-pink border-t-transparent rounded-full" />
                  <span className="text-sm">{isUploading ? 'Uploading...' : 'Processing...'}</span>
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