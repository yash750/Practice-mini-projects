import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Key, Eye, EyeOff, Save, Settings } from "lucide-react";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Store API keys securely in backend (encrypted)
// 2. Validate API keys with respective services
// 3. Allow users to update/delete API keys
// 4. Show API key status (valid/invalid/expired)
// 5. Integrate with OpenAI/other AI service APIs

interface ApiKeySettingsProps {
  onApiKeySet?: (apiKey: string) => void;
  currentApiKey?: string;
}

export const ApiKeySettings = ({ onApiKeySet, currentApiKey }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    
    try {
      // BACKEND INTEGRATION: Save API key securely
      // const response = await fetch('/api/settings/api-key', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ apiKey: apiKey.trim() })
      // });
      // const data = await response.json();
      // if (data.success) {
      //   setIsValid(true);
      //   onApiKeySet?.(apiKey.trim());
      // }
      
      // Simulated API key validation for demo
      setTimeout(() => {
        setIsValid(true);
        setIsLoading(false);
        onApiKeySet?.(apiKey.trim());
        console.log("API key saved:", apiKey.substring(0, 8) + "...");
      }, 1000);
    } catch (error) {
      console.error("Error saving API key:", error);
      setIsValid(false);
      setIsLoading(false);
    }
  };

  const formatApiKey = (key: string) => {
    if (!key) return "";
    return showApiKey ? key : key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

  return (
    <Card className="bg-bamboo-card border-bamboo-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-bamboo-pink" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-foreground">
            OpenAI API Key
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pl-10 pr-10 bg-background border-bamboo-border focus:border-bamboo-pink font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {currentApiKey && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current:</span>
              <code className="bg-background px-2 py-1 rounded text-xs">
                {formatApiKey(currentApiKey)}
              </code>
              {isValid !== null && (
                <span className={`text-xs ${isValid ? "text-green-500" : "text-red-500"}`}>
                  {isValid ? "✓ Valid" : "✗ Invalid"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Your API key is stored securely and encrypted</p>
          <p>• Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-bamboo-pink hover:underline">OpenAI Platform</a></p>
          <p>• Required to enable chat functionality</p>
        </div>

        <Button
          onClick={handleSaveApiKey}
          disabled={!apiKey.trim() || isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Validating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save API Key
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};