import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { ToolMode, AppLanguage } from '../types';
import { chatWithAiAssistant } from '../services/geminiService';

interface AiAssistantProps {
  onSelectTool: (toolId: ToolMode) => void;
  currentTool: ToolMode;
  language: AppLanguage;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  toolId?: string; // If model recommends a tool
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onSelectTool, currentTool, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: language === 'he' 
        ? 'היי! אני העוזר האישי של StudioPlay. תאר לי מה את/ה רוצה ליצור, ואמליץ לך על הכלי המתאים.' 
        : 'Hi! I\'m your StudioPlay Assistant. Describe what you want to create, and I\'ll recommend the right tool.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);

    try {
      // Call Gemini API
      const response = await chatWithAiAssistant(
        newHistory.map(m => ({ role: m.role, content: m.content })),
        userMsg,
        currentTool
      );

      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: response.text, 
          toolId: response.recommendedToolId 
        }
      ]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [
        ...prev, 
        { role: 'model', content: language === 'he' ? 'מצטער, נתקלתי בבעיה. נסה שוב.' : 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-40 bottom-6 ${language === 'he' ? 'left-6' : 'right-6'} w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-800 rotate-90 text-white' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white animate-pulse'}`}
      >
        {isOpen ? <Icons.X className="w-6 h-6" /> : <Icons.MessageCircle className="w-7 h-7" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bottom-24 ${language === 'he' ? 'left-6' : 'right-6'} w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300`}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-gradient-to-r from-purple-900/50 to-slate-900 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <Icons.Bot className="w-5 h-5 text-purple-300" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-white">StudioPlay AI</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400">{language === 'he' ? 'מחובר' : 'Online'}</span>
                </div>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                    }`}
                 >
                    {msg.content}
                    
                    {/* Tool Recommendation Button */}
                    {msg.toolId && (
                      <button 
                        onClick={() => {
                          onSelectTool(msg.toolId as ToolMode);
                          // Optional: Close chat on selection or keep open? keeping open for now.
                        }}
                        className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                         <Icons.Sparkles className="w-3 h-3 text-yellow-400" />
                         {language === 'he' ? 'עבור לכלי זה' : 'Switch to Tool'}
                      </button>
                    )}
                 </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/5 bg-slate-900">
             <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 pr-2 pl-2 focus-within:border-purple-500/50 transition-colors">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={language === 'he' ? "שאל אותי..." : "Ask me..."}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 py-2 placeholder:text-slate-600"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                   <Icons.Send className={`w-4 h-4 ${language === 'he' ? 'rotate-180' : ''}`} />
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;