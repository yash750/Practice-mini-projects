import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Call authentication API endpoint (POST /auth/login)
// 2. Handle JWT token storage in localStorage/cookies
// 3. Implement form validation with proper error handling
// 4. Redirect to dashboard on successful login
// 5. Show loading states during authentication

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // BACKEND INTEGRATION: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      // if (data.token) {
      //   localStorage.setItem('token', data.token);
      //   onSuccess();
      // }
      
      // Simulated login for UI demo
      setTimeout(() => {
        console.log("Login attempted with:", formData);
        setIsLoading(false);
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="pl-10 bg-background border-bamboo-border focus:border-bamboo-pink"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="pl-10 pr-10 bg-background border-bamboo-border focus:border-bamboo-pink"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-primary hover:opacity-90 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Submit"}
      </Button>
    </form>
  );
};