
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hello! I'm your AI assistant. How can I help you today?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Log request details for debugging
      console.log('Sending request to AI assistant with messages:', [...messages, userMessage]);

      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: { 
          messages: [...messages, userMessage]
        }
      });

      if (error) {
        console.error('Supabase Function Error:', {
          error,
          statusCode: error.status,
          statusText: error.message,
          context: error.context
        });
        
        // Provide specific error messages based on error type
        let errorMessage = "Failed to get a response. Please try again.";
        if (error.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = "Authentication error. Please try refreshing the page.";
        } else if (error.status === 500) {
          errorMessage = "Server error. Our team has been notified.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        throw error;
      }

      // Log successful response
      console.log('AI assistant response:', data);

      if (data?.message) {
        const assistantMessage = {
          role: "assistant" as const,
          content: data.message
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format from AI assistant');
      }
    } catch (error) {
      console.error('AI Assistant Error:', {
        error,
        timestamp: new Date().toISOString(),
        lastMessage: userMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });

      // Add error message to chat for transparency
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error processing your request. Please try again or rephrase your question."
      }]);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        className="floating-assistant assistant-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="assistant-panel fixed bottom-24 right-8 w-[500px] bg-background/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              className="hover:bg-secondary/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[400px] mb-6 pr-4">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-secondary/50 backdrop-blur-sm mr-12"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-secondary/50 border-secondary/50 backdrop-blur-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
