import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader, User, Bot, Zap, Brain, MessageSquare, Rocket, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AIChat({ experiments }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI assistant. Ask me to compare models, analyze trends, or suggest improvements!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    { text: '🏆 What is my best performing experiment?', icon: '🏆' },
    { text: '📊 Compare the top 3 experiments', icon: '📊' },
    { text: '⚠️ Which experiments have overfitting issues?', icon: '⚠️' },
    { text: '✨ Show me experiments with accuracy above 90%', icon: '✨' },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);
    setIsTyping(true);

    try {
      const contextData = experiments.map(exp => ({
        name: exp.experimentName,
        metrics: exp.metrics,
        status: exp.status,
        model: exp.model?.name,
        hyperparameters: exp.hyperparameters,
        config: exp.trainingConfig
      }));

      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, context: JSON.stringify(contextData) })
      });

      const data = await response.json();
      
      setIsTyping(false);
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.answer, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing request.', timestamp: new Date() }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-2xl h-[calc(100vh-220px)] flex flex-col">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-4 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Assistant</h2>
            <p className="text-xs text-purple-100 opacity-90">Powered by Gemini • {experiments.length} experiments loaded</p>
          </div>
        </div>
      </div>

      {/* Collapsible Suggestions (Saves Space) */}
      <div className="bg-white/60 border-b border-white/20 shrink-0">
        <details className="group px-4 py-2 cursor-pointer">
          <summary className="flex items-center justify-between text-sm font-bold text-purple-700 list-none">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Suggested Questions</span>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pb-2 animate-slide-in-right">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q.text)}
                className="text-left text-xs px-3 py-2 bg-white rounded-lg border border-purple-100 hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center gap-2"
              >
                <span>{q.icon}</span> {q.text}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                : 'bg-white/90 text-gray-800 border border-gray-100'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Loader className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
            <div className="bg-white/50 px-4 py-2 rounded-xl text-xs text-gray-500 italic">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/20 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 bg-white/90"
          />
          <button onClick={handleSend} disabled={loading} className="px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}