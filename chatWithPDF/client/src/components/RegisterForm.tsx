import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Call registration API endpoint (POST /auth/register)
// 2. Implement proper form validation (email format, password strength)
// 3. Handle email verification flow if required
// 4. Show success message and redirect to login or auto-login
// 5. Handle validation errors from backend

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // BACKEND INTEGRATION: Replace with actual API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // });
      // const data = await response.json();
      // if (data.success) {
      //   onSuccess();
      // }
      
      // Simulated registration for UI demo
      setTimeout(() => {
        console.log("Registration attempted with:", formData);
        setIsLoading(false);
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="pl-10 bg-background border-bamboo-border focus:border-bamboo-pink"
            required
          />
        </div>
      </div>

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
            placeholder="Create a password"
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
        <div className="relative">
          <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="pl-10 pr-10 bg-background border-bamboo-border focus:border-bamboo-pink"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-primary hover:opacity-90 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Submit"}
      </Button>
    </form>
  );
};