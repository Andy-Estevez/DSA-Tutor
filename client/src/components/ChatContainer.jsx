import { useState, useEffect } from "react";

import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

import { fetchTutorResponse, fetchInitialHistory } from "../services/api";

export default function ChatContainer({ className }) {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchInitialHistory();
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadHistory();
  }, []);

  const handleSendMessage = async (content) => {
    const updatedMessages = [...messages, { role: "user", content }];

    // 1. Optimistic update + temporary loading state
    setMessages([
      ...updatedMessages,
      { role: "tutor", content: "Thinking..." },
    ]);
    setIsProcessing(true);

    try {
      // 2. Fetch the real response using the old history
      const tutorReply = await fetchTutorResponse(content, messages);

      // 3. Swap the loading placeholder with the actual reply
      setMessages([...updatedMessages, tutorReply]);
    } catch (error) {
      console.error("Failed to fetch tutor response:", error);
      setMessages(updatedMessages); // Rollback on error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <ChatHistory className="flex-1 overflow-y-auto" messages={messages} />
      <ChatInput
        className="shrink-0"
        isDisabled={isProcessing}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
