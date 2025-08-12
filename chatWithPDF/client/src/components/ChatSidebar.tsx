import { Button } from './ui/button';
import { MessageSquare, Plus, Trash2, FileText, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useChatManager } from '../hooks/useChatManager';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ChatSidebarProps {
  onNewChat: () => void;
  onChatSelect?: (chatId: string) => void;
}

export const ChatSidebar = ({ onNewChat, onChatSelect }: ChatSidebarProps) => {
  const { chats, activeChat, setActiveChat, deleteChat, clearChat } = useChatManager();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    onChatSelect?.(chatId);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <div className={`bg-background border-r border-border h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64 md:w-64'} ${isCollapsed ? '' : 'min-w-64'}`}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold text-foreground">Chat History</h2>
          )}
          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="h-8 w-8 p-0 hover:bg-accent"
                title="New Chat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-accent"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* New Chat Button - Full Width when expanded */}
        {!isCollapsed && (
          <Button
            onClick={handleNewChat}
            className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`p-2 rounded-md cursor-pointer transition-all duration-200 group flex items-center justify-center ${
                  activeChat === chat.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
                title={chat.fileName}
              >
                <MessageSquare className="h-4 w-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative rounded-md cursor-pointer transition-all duration-200 ${
                      activeChat === chat.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div
                      onClick={() => handleChatSelect(chat.id)}
                      className="p-3 pr-10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate leading-5">
                            {chat.fileName || 'Untitled Chat'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Menu */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-accent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id, e);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};