"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview";
import { Loader } from "lucide-react";
import { useState } from "react";

interface Chat {
  id: string;
  demo: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: "user" | "assistant";
      content: string;
    }>
  >([]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { type: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/v0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChat?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const chat: Chat = await response.json();
      setCurrentChat(chat);

      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Generated new app preview. Check the preview panel!",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            "Sorry, there was an error creating your app. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Chat Panel */}
      <div className="w-1/2 flex flex-col border-r">
        {/* Header */}
        <div className="border-b p-3 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">v0 Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center font-semibold mt-8">
              <p className="text-3xl mt-4">What can we build together?</p>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {chatHistory.map((msg, index) => (
                    <Message from={msg.type} key={index}>
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader />
                      Creating your app...
                    </div>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {!currentChat && (
            <Suggestions>
              <Suggestion
                onClick={() =>
                  setMessage("Create a responsive navbar with Tailwind CSS")
                }
                suggestion="Create a responsive navbar with Tailwind CSS"
              />
              <Suggestion
                onClick={() =>
                  setMessage("Create a responsive footer with Tailwind CSS")
                }
                suggestion="Create a responsive footer with Tailwind CSS"
              />
              <Suggestion
                onClick={() =>
                  setMessage("Create a responsive sidebar with Tailwind CSS")
                }
                suggestion="Create a responsive sidebar with Tailwind CSS"
              />
            </Suggestions>
          )}
          <div className="flex gap-2">
            <PromptInput
              onSubmit={handleSendMessage}
              className="mt-4 w-full max-w-2xl mx-auto relative"
            >
              <PromptInputTextarea
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                className="pr-12 min-h-[60px]"
              />
              <PromptInputSubmit
                className="absolute bottom-1 right-1"
                disabled={!message}
                status={isLoading ? "streaming" : "ready"}
              />
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col">
          <WebPreview>
            <WebPreviewNavigation>
                <WebPreviewUrl readOnly placeholder="Your app here..." value={currentChat?.demo} />
                
            </WebPreviewNavigation>
            <WebPreviewBody src={currentChat?.demo} />
          </WebPreview>
      </div>
    </div>
  );
}
