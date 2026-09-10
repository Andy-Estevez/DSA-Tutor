import { useState } from "react";

export default function ChatInput({ className, isDisabled, onSendMessage }) {
  const [content, setContent] = useState("");

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (content.trim() === "") return;

      onSendMessage(content);
      setContent("");
    }
  };

  return (
    <textarea
      value={content}
      disabled={isDisabled}
      placeholder={isDisabled ? "Please wait..." : "Type your message here..."}
      className={`resize-none border border-gray-800 bg-gray-900 p-6 text-gray-300 placeholder:text-gray-500 focus:border-gray-700 focus:outline-none ${className}`}
      rows="1"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
