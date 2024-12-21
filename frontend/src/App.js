import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css"; // Import external CSS

function App() {
  const [prompt, setPrompt] = useState("");
  const [accumulatedText, setAccumulatedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const eventSourceRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Reset states
    setAccumulatedText("");
    setIsStreaming(true);
    setIsComplete(false);

    // Close any old SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const url = `http://localhost:8000/stream?prompt=${encodeURIComponent(prompt)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (evt) => {
      try {
        // Parse the JSON we sent from the backend
        const parsed = JSON.parse(evt.data);
        const token = parsed.token; // real text containing \n
        setAccumulatedText((prev) => prev + token);
      } catch (err) {
        console.error("Failed to parse SSE chunk:", evt.data, err);
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      setIsComplete(true);
    };

    es.onclose = () => {
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      setIsComplete(true);
    };
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Ask ChatGPT</h1>
      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          className="prompt-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Your question here"
        />
        <button type="submit" className="ask-button">
          Ask
        </button>
      </form>

      <h2>Response:</h2>

      <div className="response-container">
        {/* Show partial text while streaming */}
        {!isComplete && (
          <>
            {isStreaming && !accumulatedText && <em>Loading...</em>}
            <div className="partial-text">{accumulatedText}</div>
          </>
        )}

        {/* Once streaming is done, display the final text as Markdown */}
        {isComplete && (
          <ReactMarkdown className="markdown-output">
            {accumulatedText}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default App;