import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Video, Upload } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Choose what you'd like to do today</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/chat/pdf")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Chat with PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload and chat with your PDF documents. Get insights, summaries, and answers from your files.
            </p>
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Start PDF Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/chat/video")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              Chat with Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload and analyze video content. Extract information and get insights from your videos.
            </p>
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Start Video Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};