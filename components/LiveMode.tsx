import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceService } from '../services/voiceService';
import * as aiService from '../services/aiService';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatSession } from '../types';

interface LiveModeProps {
    onClose: () => void;
    chatSession: ChatSession | null;
    onMessage: (role: 'user' | 'model', content: string) => void;
}

export const LiveMode: React.FC<LiveModeProps> = ({ onClose, chatSession, onMessage }) => {
    const { startListening, stopListening, speak, stopSpeaking, isListening, isSpeaking } = useVoiceService();
    const { language, t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');

    // Initialize chat session
    useEffect(() => {
        if (!chatSession) {
            setResponse("Error: No active chat session found.");
            return;
        }

        // Greet the user
        const greeting = "Hello! I'm listening. Ask me anything about the food.";
        speak(greeting, language, () => setStatus('idle'));
        setResponse(greeting);
        setStatus('speaking');

        return () => {
            stopSpeaking();
            stopListening();
        };
    }, [chatSession, language, speak, stopListening, stopSpeaking]);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
            setStatus('idle');
        } else {
            stopSpeaking(); // Stop any current speech
            setTranscript('');
            setStatus('listening');
            startListening(
                (text) => {
                    setTranscript(text);
                    handleUserQuery(text);
                },
                (error) => {
                    console.error("Voice error:", error);
                    setStatus('idle');
                    setResponse("I didn't catch that. Tap the mic to try again.");
                },
                language
            );
        }
    };

    const handleUserQuery = async (text: string) => {
        if (!chatSession) return;

        // Update parent state with user message
        onMessage('user', text);

        setStatus('thinking');
        try {
            const aiResponse = await chatSession.sendMessage(text);
            setResponse(aiResponse);

            // Update parent state with AI response
            onMessage('model', aiResponse);

            setStatus('speaking');
            speak(aiResponse, language, () => setStatus('idle'));
        } catch (error) {
            console.error(error);
            setResponse("Sorry, I had trouble connecting. Please try again.");
            setStatus('idle');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-between p-6">
            {/* Header */}
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white font-semibold">Live Speech Mode</span>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700">
                    <X size={24} />
                </button>
            </div>

            {/* Visualizer / Status */}
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md text-center space-y-8">

                {/* Orb Animation */}
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: status === 'listening' ? [1, 1.2, 1] : status === 'speaking' ? [1, 1.1, 1] : 1,
                            opacity: status === 'thinking' ? 0.5 : 1,
                        }}
                        transition={{ repeat: Infinity, duration: status === 'listening' ? 1.5 : 2 }}
                        className={`w-32 h-32 rounded-full blur-xl ${status === 'listening' ? 'bg-blue-500' :
                            status === 'speaking' ? 'bg-emerald-500' :
                                status === 'thinking' ? 'bg-purple-500' : 'bg-gray-600'
                            }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {status === 'listening' && <Mic size={48} className="text-white" />}
                        {status === 'speaking' && <Volume2 size={48} className="text-white" />}
                        {status === 'thinking' && <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />}
                        {status === 'idle' && <MicOff size={48} className="text-gray-400" />}
                    </div>
                </div>

                {/* Text Display */}
                <div className="space-y-4 min-h-[100px]">
                    <AnimatePresence mode='wait'>
                        {transcript && (
                            <motion.p
                                key="transcript"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-xl text-gray-300 font-medium"
                            >
                                "{transcript}"
                            </motion.p>
                        )}
                        {response && status !== 'listening' && (
                            <motion.p
                                key="response"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-lg text-emerald-400"
                            >
                                {response}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-md flex justify-center pb-8">
                <button
                    onClick={handleMicClick}
                    className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-lg ${status === 'listening'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                >
                    {status === 'listening' ? <MicOff size={32} color="white" /> : <Mic size={32} color="white" />}
                </button>
            </div>
        </div>
    );
};
