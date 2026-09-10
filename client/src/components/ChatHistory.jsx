import { useEffect, useRef } from "react";

import ChatMessage from "./ChatMessage";

export default function ChatHistory({ className, messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex flex-col gap-8 bg-gray-950 px-[10%] py-8 ${className}`}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          content={message.content}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
