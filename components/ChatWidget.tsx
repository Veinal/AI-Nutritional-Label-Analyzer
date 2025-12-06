import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatMessage } from '../types';
import { SparklesIcon } from './Icon';

interface ChatWidgetProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window Popup */}
            <div
                className={`
                    mb-4 w-96 max-w-[90vw] h-[500px] max-h-[70vh] 
                    transition-all duration-300 origin-bottom-right transform 
                    ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
                `}
            >
                <ChatWindow
                    {...props}
                    onClose={() => setIsOpen(false)}
                />
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group flex items-center justify-center
                    h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 
                    rounded-full shadow-2xl text-white transition-all duration-300 transform 
                    ${isOpen ? 'w-14 bg-gray-700 rotate-90' : 'w-14 hover:w-40 hover:justify-start hover:pl-4'}
                `}
            >
                <div className={`${isOpen ? 'rotate-90' : ''} transition-transform duration-300`}>
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <SparklesIcon className="w-8 h-8" />
                    )}
                </div>

                {/* Text on hover */}
                {!isOpen && (
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap ml-0 group-hover:ml-3 text-sm font-bold opacity-0 group-hover:opacity-100">
                        Chat with AI
                    </span>
                )}
            </button>
        </div>
    );
};
