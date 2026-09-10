export async function fetchTutorResponse(content, messages) {
    const apiUrl = import.meta.env.VITE_API_URL
  
    const response = await fetch(`${apiUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: content, history: messages }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

export async function fetchInitialHistory() {
  const baseUrl = import.meta.env.VITE_API_URL;
  
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}