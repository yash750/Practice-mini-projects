import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import { useToast } from "./ui/use-toast";

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {!user.isVerified && (
            <p className="text-xs text-amber-600">Email not verified</p>
          )}
        </div>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="ml-auto"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};