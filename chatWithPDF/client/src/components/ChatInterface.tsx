import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Send, Bot, User, ExternalLink, Copy, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "../services/api";
import { useToast } from "./ui/use-toast";
import { useChatManager } from "../hooks/useChatManager";

interface ContextData {
  id: number;
  title: string;
  page: string | number;
  content: string;
  preview: string;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
  context?: string;
  contextData?: ContextData[];
}

interface ChatInterfaceProps {
  fileContext?: File | null;
  fileType?: "pdf" | "video";
  isFileReady?: boolean;
  collectionName?: string;
  fileId?: string;
  fileName?: string;
}

export const ChatInterface = ({ fileContext, fileType, isFileReady, collectionName, fileId, fileName }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { getChatForFile, addMessage, getActiveMessages, getActiveChatInfo } = useChatManager();
  
  const messages = getActiveMessages();
  const activeChatInfo = getActiveChatInfo();
  
  // Initialize chat when file changes
  useEffect(() => {
    if (fileId && fileName && collectionName) {
      getChatForFile(fileId, fileName, collectionName);
    }
  }, [fileId, fileName, collectionName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (fileType === 'pdf' && !isFileReady) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    if (activeChatInfo) {
      addMessage(activeChatInfo.id, userMessage);
    }
    const currentMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      if (fileType === 'pdf') {
        console.log('Using collection name:', collectionName);
        const response = await apiService.chatWithPDF(currentMessage, collectionName || 'pdf');
        
        if (response.success) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "assistant",
            content: response.answer,
            timestamp: new Date(),
            context: response.context,
            contextData: response.contextData,
            references: response.contextData?.map((ctx: any, index: number) => 
              `Reference ${index + 1}: ${ctx.title || 'Document'} (Page ${ctx.page})`
            )
          };
          
          if (activeChatInfo) {
            addMessage(activeChatInfo.id, aiMessage);
          }
        }
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Video chat functionality is not yet implemented. Please use PDF chat for now.",
          timestamp: new Date()
        };
        
        if (activeChatInfo) {
          addMessage(activeChatInfo.id, aiMessage);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const rateMessage = (messageId: string, rating: "up" | "down") => {
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your ${rating === 'up' ? 'positive' : 'negative'} feedback!`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <Card className="flex-1 bg-bamboo-card border-bamboo-border flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-bamboo-pink" />
            Ask Bamboo
            {activeChatInfo && (
              <span className="text-sm text-muted-foreground">
                • {activeChatInfo.fileName}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-bamboo-pink" />
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p>Ask me anything about {fileContext ? `your ${fileType} file` : "the uploaded content"}!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === "assistant" && (
                      <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[80%] space-y-2",
                      message.type === "user" ? "order-1" : "order-2"
                    )}>
                      <div className={cn(
                        "p-4 rounded-lg",
                        message.type === "user"
                          ? "bg-gradient-primary text-white"
                          : "bg-background border border-bamboo-border"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      
                      {message.contextData && message.contextData.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-bamboo-pink" />
                            <p className="text-sm font-medium text-foreground">Retrieved Context ({message.contextData.length} sources):</p>
                          </div>
                          <div className="space-y-3">
                            {message.contextData.map((ctx) => (
                              <div key={ctx.id} className="bg-muted/30 border border-bamboo-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="bg-bamboo-pink/10 p-2 rounded-md flex-shrink-0">
                                    <FileText className="h-4 w-4 text-bamboo-pink" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground mb-1">{ctx.title}</p>
                                    <p className="text-xs text-muted-foreground">Page {ctx.page}</p>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground leading-relaxed pl-11">
                                  "{ctx.preview}"
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.type === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rateMessage(message.id, "up")}
                            className="h-6 px-2 text-muted-foreground hover:text-green-500"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rateMessage(message.id, "down")}
                            className="h-6 px-2 text-muted-foreground hover:text-red-500"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {message.type === "user" && (
                      <div className="h-8 w-8 bg-bamboo-card border border-bamboo-border rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-background border border-bamboo-border p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-bamboo-pink border-t-transparent rounded-full" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Chat Input */}
      <div className="mt-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Bamboo anything..."
            className="flex-1 bg-background border-bamboo-border focus:border-bamboo-pink"
            disabled={isLoading || (fileType === 'pdf' && !isFileReady)}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading || (fileType === 'pdf' && !isFileReady)}
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {fileType === 'pdf' && !isFileReady && (
          <p className="text-xs text-muted-foreground mt-2">
            Upload a PDF file first to start chatting
          </p>
        )}
      </div>
    </div>
  );
};