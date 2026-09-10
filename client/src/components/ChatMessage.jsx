export default function ChatMessage({ role, content }) {
  if (role !== "user" && role !== "tutor") {
    console.error(
      `ChatMessage Error: Expected role "user" or "tutor", but received "${role}"`,
    );

    return null;
  }

  return (
    <div
      className={`w-fit max-w-[90%] rounded-2xl p-4 wrap-break-word whitespace-pre-wrap text-gray-300 ${
        role === "user" ? "ml-auto bg-gray-900" : "mr-auto bg-gray-800"
      }`}
    >
      {content}
    </div>
  );
}
