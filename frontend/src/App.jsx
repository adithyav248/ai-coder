import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Coder. I can explain code, fix bugs, or generate files for you.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Add user message to UI
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 2. Send to Backend
      // Use environment variable if available, otherwise default to localhost
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/chat`, {
              message: input
      });

      // 3. Add AI response to UI
      const aiMsg = { role: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error:", error);
      const errorMsg = { role: 'ai', content: "Sorry, something went wrong connecting to the server." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>AI Code Assistant</h1>
      </header>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              ...styles.messageRow, 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              ...styles.bubble,
              backgroundColor: msg.role === 'user' ? '#007bff' : '#2d2d2d',
              color: '#fff'
            }}>
              {/* Render Markdown for nice code display */}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div style={styles.loading}>Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask to explain code, fix a bug, or generate a file..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// Simple internal CSS styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#1e1e1e',
    color: 'white'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #333',
    textAlign: 'center',
    backgroundColor: '#252526'
  },
  chatBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: '10px',
    lineHeight: '1.5',
    fontSize: '14px'
  },
  loading: {
    color: '#888',
    fontStyle: 'italic',
    padding: '10px'
  },
  inputArea: {
    padding: '20px',
    backgroundColor: '#252526',
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #333'
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: 'white',
    resize: 'none',
    height: '50px'
  },
  button: {
    padding: '0 25px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default App;