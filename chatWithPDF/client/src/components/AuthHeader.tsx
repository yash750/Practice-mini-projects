import { Button } from "./ui/button";
import { BambooLogo } from "./BambooLogo";

interface AuthHeaderProps {
  currentMode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export const AuthHeader = ({ currentMode, onModeChange }: AuthHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      <BambooLogo size="md" showText={true} />
      
      <div className="flex gap-2">
        <Button
          variant={currentMode === "register" ? "ghost" : "ghost"}
          onClick={() => onModeChange("register")}
          className="text-muted-foreground hover:text-foreground"
        >
          Register
        </Button>
        <Button
          variant={currentMode === "login" ? "ghost" : "ghost"}
          onClick={() => onModeChange("login")}
          className="text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};