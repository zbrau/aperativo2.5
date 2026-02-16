import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getAIRecommendation } from '../services/geminiService';

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '¡Hola! Soy tu asistente de la cafetería. ¿No sabes qué pedir? Pregúntame por opciones saludables, baratas o lo más rico del día.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Build simplified history for context (last 4 messages)
        const historyContext = messages.slice(-4).map(m => `${m.role}: ${m.text}`);
        
        const responseText = await getAIRecommendation(userMsg.text, historyContext);
        
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen ? 'bg-red-500 rotate-90 scale-0 opacity-0 hidden' : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:scale-105 animate-bounce-in'
                }`}
            >
                <Sparkles className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-0 right-0 w-full md:w-96 h-[80vh] md:h-[600px] md:bottom-24 md:right-8 bg-white dark:bg-gray-900 shadow-2xl z-50 md:rounded-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 transition-colors animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6 animate-pulse" />
                            <div>
                                <h3 className="font-bold">NutriBot</h3>
                                <p className="text-xs opacity-90">Asistente Inteligente</p>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded-full transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950 space-y-4 transition-colors">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-green-600 dark:text-green-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Escribiendo...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent dark:border-gray-700">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregunta por el menú..."
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                            />
                            <button 
                                onClick={handleSend} 
                                disabled={!input.trim() || isLoading}
                                className={`p-2 rounded-full transition ${
                                    input.trim() ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30' : 'text-gray-400 dark:text-gray-600'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;