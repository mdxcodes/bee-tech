import { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Paperclip, CheckCircle2, ChevronDown, ChevronUp, Download, Languages, RefreshCw } from "lucide-react";
import { sendChatMessage, cancelOrder } from "../services/api.js";

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildActivity(response, userMessage) {
  if (!response || response.error) return [];
  const items = response.items || [];
  const itemSummary = items.map((i) => `${i.quantity} ${i.unit || ""} ${i.product_name}`).join(", ");
  const steps = [
    { action: "Received customer request", detail: `"${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}"` },
    { action: "Understood products and quantities", detail: itemSummary || "General inquiry" },
    { action: "Checked inventory", detail: items.length > 0 ? "All items available" : "N/A" },
    { action: "Checked prices", detail: response.total ? `Total: ₹${response.total}` : "N/A" },
    { action: "Calculated total", detail: response.total ? `₹${response.total}` : "N/A" },
  ];
  if (response.order_id) {
    steps.push({ action: "Created structured order", detail: response.order_id });
    steps.push({ action: "Updated inventory", detail: "Stock deducted" });
    steps.push({ action: "Sent confirmation to customer", detail: "Message sent" });
  }
  return steps;
}

function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, type: "ai", text: "Namaste! 🙏 Welcome to Kirana Store AI Operator. How can I help you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [customerId] = useState(() => "guest-" + Math.random().toString(36).slice(2, 8));
  const [expandedActivity, setExpandedActivity] = useState({});
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "en-IN" : "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      inputRef.current?.focus();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "en-IN" : "en-US";
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMessage = { id: Date.now(), type: "user", text: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(trimmed, customerId, language);
      const activity = buildActivity(response, trimmed);
      const aiMessage = { id: Date.now() + 1, type: "ai", response, text: response.message, timestamp: new Date(), activity };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "error", text: "Something went wrong. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (text) => {
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleActivity = (msgId) => {
    setExpandedActivity((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const renderResponse = (msg) => {
    const response = msg.response;
    if (!response) return <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.text}</p>;

    if (response.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">⚠️ {response.error}</p>
        </div>
      );
    }

    const isUnavailable = response.available === false;

    return (
      <div className="space-y-3">
        {msg.text && <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.text}</p>}

        {isUnavailable && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800 font-medium">Sorry! 😕</p>
            <p className="text-sm text-orange-700 mt-1">
              Only {response.available_quantity} {response.product}(s) available.
            </p>
            <p className="text-sm text-orange-700">You requested {response.requested}.</p>
          </div>
        )}

        {response.items && response.items.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-ocean-50 px-3 py-2 border-b border-ocean-100">
              <p className="text-xs font-semibold text-ocean-700 uppercase tracking-wide">🧾 Price Summary</p>
            </div>
            <div className="p-3 space-y-2">
              {response.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{item.product_name}</span>
                    {item.quantity && (
                      <span className="text-gray-500">
                        {" "}× {item.quantity} {item.unit || ""}
                      </span>
                    )}
                  </div>
                  {item.unit_price && (
                    <span className="text-gray-600">₹{(item.unit_price * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                  )}
                </div>
              ))}
              {response.total !== undefined && (
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-ocean-600 text-lg">₹{response.total.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {response.order_id && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-ocean-700 text-white text-center py-3">
              <p className="font-bold text-sm tracking-wide">KIRANA STORE</p>
              <p className="text-xs text-ocean-100">Order #{response.order_id}</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">Guest Customer</p>
              </div>

              <div className="space-y-2.5">
                {response.items?.map((item, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-gray-700">{item.product_name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.quantity} {item.unit || ""} × ₹{item.unit_price} = ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                    </p>
                    <p className="text-right text-gray-600 font-medium mt-0.5">
                      ₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">Total</span>
                <span className="font-bold text-ocean-600 text-lg">₹{response.total?.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 size={16} className="text-palm-DEFAULT" />
                <span className="text-sm text-palm-DEFAULT font-medium">Order Confirmed</span>
              </div>

              <div className="text-xs text-gray-400">{formatDate(new Date())}</div>

              <button
                onClick={() => window.print()}
                className="w-full bg-ocean-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-ocean-700 flex items-center justify-center gap-2 mt-2"
              >
                <Download size={14} />
                Download / Print Bill
              </button>
            </div>
          </div>
        )}

        {msg.activity && msg.activity.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={() => toggleActivity(msg.id)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-ocean-600 w-full"
            >
              🤖 AI Operator Activity
              {expandedActivity[msg.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedActivity[msg.id] && (
              <div className="mt-2 space-y-2">
                {msg.activity.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-palm-DEFAULT mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700">{step.action}</p>
                      {step.detail && <p className="text-gray-500">{step.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-sand-50">
      {/* Header */}
      <header className="bg-ocean-700 text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ocean-600 rounded-full flex items-center justify-center text-xl">🏪</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Kirana AI Store</h1>
            <div className="flex items-center gap-1.5 text-xs text-ocean-100">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              AI Operator Online
            </div>
          </div>
        </div>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none bg-ocean-800 text-white text-xs px-3 py-1.5 pr-8 rounded-lg border border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-400"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
          <Languages size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-ocean-200 pointer-events-none" />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sand-50">
        {messages.map((msg) => {
          if (msg.type === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-ocean-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-ocean-100 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            );
          }

          if (msg.type === "error") {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                  <p className="text-sm">⚠️ {msg.text}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="bg-white border border-sand-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm">
                {renderResponse(msg)}
                <p className="text-xs text-gray-400 mt-2">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-sand-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-ocean-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-500">AI is checking your request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-white border-t border-sand-200 flex gap-2 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => handleQuickAction("What is the price of rice?")}
          className="text-xs bg-ocean-50 text-ocean-700 px-3 py-1.5 rounded-full border border-ocean-200 hover:bg-ocean-100 whitespace-nowrap font-medium"
        >
          Check Price
        </button>
        <button
          onClick={() => handleQuickAction("Is rice available?")}
          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 whitespace-nowrap font-medium"
        >
          Check Availability
        </button>
        <button
          onClick={() => handleQuickAction("I want 2 kg rice and 1 litre oil")}
          className="text-xs bg-palm-light/20 text-palm-DEFAULT px-3 py-1.5 rounded-full border border-palm-light hover:bg-palm-light/40 whitespace-nowrap font-medium"
        >
          Place Order
        </button>
        <button
          onClick={() => handleQuickAction("Cancel my order")}
          className="text-xs bg-shell-light/20 text-shell-dark px-3 py-1.5 rounded-full border border-shell hover:bg-shell-light/30 whitespace-nowrap font-medium"
        >
          Cancel Order
        </button>
        <button
          onClick={() => {
            setMessages([
              { id: Date.now(), type: "ai", text: "Namaste! 🙏 Welcome to Kirana Store AI Operator. How can I help you today?", timestamp: new Date() },
            ]);
          }}
          className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full border border-sand-300 hover:bg-sand-50 whitespace-nowrap font-medium"
        >
          + New Request
        </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-sand-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-ocean-600 transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your order... / अपना order लिखें..."
            disabled={loading}
            className="flex-1 border border-sand-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start voice input"}
            className={`p-2.5 rounded-full transition-colors ${
              isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:text-ocean-600"
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-ocean-600 text-white rounded-full hover:bg-ocean-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Listening... speak now
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
