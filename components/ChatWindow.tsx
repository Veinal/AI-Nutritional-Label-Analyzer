
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { SendIcon, UserIcon, SparklesIcon } from './Icon';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isResponding: boolean;
}

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-emerald-500' : 'bg-cyan-500'}`}>
        {isModel ? <SparklesIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div className={`p-4 rounded-2xl max-w-lg ${isModel ? 'bg-gray-700 rounded-tl-none' : 'bg-blue-900/80 rounded-tr-none'}`}>
        <div className="text-white whitespace-pre-wrap">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isResponding }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isResponding) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl shadow-xl flex flex-col h-full max-h-[85vh]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-center">Chat with AI Advisor</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
        {isResponding && messages[messages.length - 1].role !== 'model' && (
          <div className="flex items-start gap-3 my-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="p-4 rounded-2xl max-w-lg bg-gray-700 rounded-tl-none">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-700 rounded-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about allergens, diet plans..."
            className="w-full bg-transparent p-3 text-white placeholder-gray-400 focus:outline-none"
            disabled={isResponding}
          />
          <button type="submit" disabled={isResponding || !input.trim()} className="p-3 text-white disabled:text-gray-500 disabled:cursor-not-allowed">
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
