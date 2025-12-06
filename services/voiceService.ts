import { useState, useEffect, useCallback } from 'react';

interface VoiceService {
    startListening: (onResult: (text: string) => void, onError: (error: string) => void, language?: string) => void;
    stopListening: () => void;
    speak: (text: string, language?: string, onEnd?: () => void) => void;
    stopSpeaking: () => void;
    isListening: boolean;
    isSpeaking: boolean;
}

export const useVoiceService = (): VoiceService => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = false; // Stop after one sentence/phrase like a walkie-talkie or standard assistant
            rec.interimResults = false;
            setRecognition(rec);
        }
    }, []);

    const startListening = useCallback((onResult: (text: string) => void, onError: (error: string) => void, language: string = 'en-US') => {
        if (!recognition) {
            onError("Speech recognition not supported in this browser.");
            return;
        }

        try {
            recognition.lang = language;
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                setIsListening(false);
                onError(event.error);
            };
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
            };

            recognition.start();
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setIsListening(false);
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    const speak = useCallback((text: string, language: string = 'en-US', onEnd?: () => void) => {
        if (!('speechSynthesis' in window)) {
            console.error("Text-to-speech not supported.");
            return;
        }

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        isListening,
        isSpeaking
    };
};
