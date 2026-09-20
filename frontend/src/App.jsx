import { useState } from "react";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! 👋 Welcome to our store. What would you like to order?"
    }
  ]);

  return (
    <div className="app">
      <Header />

      <main className="main-container">
        <div className="welcome-section">
          <h1>Your AI Store Operator 🛒</h1>

          <p>
            Order groceries naturally. Just tell us what you need.
          </p>
        </div>

        <ChatBox
          messages={messages}
          setMessages={setMessages}
        />
      </main>
    </div>
  );
}

export default App;