import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { BambooLogo } from "./BambooLogo";
import { FileText, Video, Upload, Sparkles } from "lucide-react";
import { AuthModal } from "./AuthModal";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Check if user is authenticated (useAuth hook)
// 2. Redirect authenticated users to dashboard
// 3. Handle session management

export const HomePage = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // TODO: Get from auth context

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-bamboo-pink/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-bamboo-purple/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <BambooLogo size="lg" showText={true} />
          
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Register
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAuth(true)}
              className="border-bamboo-border hover:bg-bamboo-card"
            >
              Sign in
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-bamboo-pink" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Lets try our{" "}
              <span className="bg-gradient-to-r from-bamboo-pink to-bamboo-purple bg-clip-text text-transparent">
                Bamboo
              </span>{" "}
              to get insights
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">
            from pdfs and videoes
          </p>
          <p className="text-lg text-muted-foreground">
            Talk with any pdf files and Videoes.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col md:flex-row gap-8 max-w-2xl mx-auto">
          <Card className="flex-1 bg-bamboo-card border-bamboo-border shadow-card hover:shadow-glow transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="h-16 w-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Talk with PDF</h3>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-lg"
                onClick={() => isAuthenticated ? navigate("/chat/pdf") : setShowAuth(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-bamboo-card border-bamboo-border shadow-card hover:shadow-glow transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="h-16 w-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Talk with Video</h3>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-lg"
                onClick={() => isAuthenticated ? navigate("/chat/video") : setShowAuth(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuth} 
        onOpenChange={setShowAuth}
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          setShowAuth(false);
        }}
      />
    </div>
  );
};