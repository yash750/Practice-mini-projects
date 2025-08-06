import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Send, Bot, User, ExternalLink, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

// BACKEND INTEGRATION COMMENT:
// This component will need to:
// 1. Connect to WebSocket for real-time chat
// 2. Send messages to AI processing endpoint
// 3. Handle file context in messages (PDF content, video transcriptions)
// 4. Implement message history storage
// 5. Add message rating/feedback system
// 6. Handle streaming responses from AI

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  references?: string[];
}

interface ChatInterfaceProps {
  fileContext?: File | null;
  fileType?: "pdf" | "video";
}

export const ChatInterface = ({ fileContext, fileType }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // BACKEND INTEGRATION: Replace with actual API call
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     message: inputValue,
      //     fileContext: fileContext ? {
      //       name: fileContext.name,
      //       type: fileType,
      //       // Include processed content or file ID
      //     } : null,
      //     conversationHistory: messages
      //   })
      // });
      // const data = await response.json();

      // Simulated AI response for UI demo
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `I understand your question about "${inputValue}". ${fileContext ? `Based on the ${fileType} file "${fileContext.name}", here's what I found:` : ""} This is a simulated response for demonstration purposes. In the actual implementation, this would be powered by AI analysis of your uploaded content.`,
          timestamp: new Date(),
          references: fileContext ? [`Page 1 of ${fileContext.name}`, `Section 2.1 of ${fileContext.name}`] : undefined
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
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
    // Show toast notification
  };

  const rateMessage = (messageId: string, rating: "up" | "down") => {
    // BACKEND INTEGRATION: Send rating to analytics endpoint
    console.log(`Rated message ${messageId} as ${rating}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <Card className="flex-1 bg-bamboo-card border-bamboo-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-bamboo-pink" />
            Ask Bamboo
            {fileContext && (
              <span className="text-sm text-muted-foreground">
                • {fileContext.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-96 px-6 py-4">
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
                      
                      {message.references && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">References:</p>
                          {message.references.map((ref, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ExternalLink className="h-3 w-3" />
                              <span>{ref}</span>
                            </div>
                          ))}
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
          </ScrollArea>
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
            disabled={isLoading || !fileContext}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading || !fileContext}
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!fileContext && (
          <p className="text-xs text-muted-foreground mt-2">
            Upload a file first to start chatting
          </p>
        )}
      </div>
    </div>
  );
};