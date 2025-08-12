import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useFileState } from '../hooks/useFileState';
import { useToast } from './ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface FileManagerProps {
  onFileSelect: (fileData: any) => void;
}

export const FileManager = ({ onFileSelect }: FileManagerProps) => {
  const { userFiles, isLoading, loadUserFiles, deleteFile, selectFile } = useFileState();
  const { toast } = useToast();

  useEffect(() => {
    loadUserFiles();
  }, []);

  const handleFileSelect = (file: any) => {
    selectFile(file);
    onFileSelect({
      id: file._id,
      filename: file.originalName,
      collectionName: file.collectionName,
      isIndexed: file.isIndexed,
      uploadedAt: file.createdAt
    });
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    const success = await deleteFile(fileId);
    if (success) {
      toast({
        title: "Success",
        description: `${fileName} deleted successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-bamboo-card border-bamboo-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-bamboo-pink border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-bamboo-card border-bamboo-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Your PDF Files</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {userFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No files uploaded yet
          </p>
        ) : (
          <div className="space-y-3">
            {userFiles.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-bamboo-border hover:border-bamboo-pink/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.originalName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {file.isIndexed ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Clock className="h-3 w-3" />
                          <span>Processing</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileSelect(file)}
                    className="text-bamboo-pink hover:text-bamboo-pink hover:bg-bamboo-pink/10"
                  >
                    Select
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file._id, file.originalName)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};