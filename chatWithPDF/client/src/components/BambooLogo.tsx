import { Bot } from "lucide-react";

interface BambooLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const BambooLogo = ({ size = "md", showText = true }: BambooLogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow`}>
          <Bot className="h-1/2 w-1/2 text-white" />
        </div>
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-bamboo-pink to-bamboo-purple bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Bamboo
        </span>
      )}
    </div>
  );
};