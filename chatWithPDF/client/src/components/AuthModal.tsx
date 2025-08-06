import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { AuthHeader } from "./AuthHeader";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

export const AuthModal = ({ open, onOpenChange, onAuthSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-bamboo-card border-bamboo-border p-0 overflow-hidden">
        <div className="flex min-h-[500px]">
          {/* Left side - Auth Forms */}
          <div className="flex-1 p-8">
            <AuthHeader currentMode={mode} onModeChange={setMode} />
            
            <div className="space-y-6">
              {mode === "register" && (
                <Card className="bg-background/50 border-bamboo-border">
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm onSuccess={() => {
                      onOpenChange(false);
                      onAuthSuccess?.();
                    }} />
                  </CardContent>
                </Card>
              )}
              
              {mode === "login" && (
                <Card className="bg-background/50 border-bamboo-border">
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Login</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LoginForm onSuccess={() => {
                      onOpenChange(false);
                      onAuthSuccess?.();
                    }} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Right side - Decorative */}
          <div className="flex-1 bg-gradient-primary p-8 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Welcome to Bamboo</h2>
              <p className="text-lg opacity-90">
                Transform how you interact with documents and videos through AI-powered conversations.
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};