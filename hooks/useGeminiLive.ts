import { useState, useRef, useEffect, useCallback } from 'react';
import { LiveSetupMessage, LiveClientMessage, LiveServerMessage } from '../types/gemini-live';

const LIVE_API_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

export const useGeminiLive = () => {
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'speaking'>('disconnected');
    const ws = useRef<WebSocket | null>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const audioQueue = useRef<Float32Array[]>([]);
    const isPlaying = useRef(false);
    const [currentVolume, setCurrentVolume] = useState(0);

    const connect = async () => {
        try {
            // 1. Get ephemeral token from your backend
            const response = await fetch('http://localhost:3001/api/get-live-token');
            if (!response.ok) throw new Error("Failed to get token");
            const { token } = await response.json();

            // 2. Connect to Gemini Live WebSocket
            const url = `${LIVE_API_URL}?key=${token}`;
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                setStatus('connected');
                sendSetupMessage();
                initAudio();
            };

            ws.current.onmessage = async (event) => {
                const message = JSON.parse(event.data) as LiveServerMessage;
                handleServerMessage(message);
            };

            ws.current.onclose = () => {
                setStatus('disconnected');
            };

            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setStatus('disconnected');
            };

        } catch (error) {
            console.error("Connection failed:", error);
            setStatus('disconnected');
        }
    };

    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
        }
        setStatus('disconnected');
    }, []);

    const sendSetupMessage = () => {
        const setup: LiveSetupMessage = {
            setup: {
                model: "models/gemini-2.5-flash",
                system_instruction: {
                    parts: [{
                        text: `You are an expert nutritionist AI. 
                   1. Analyze the video stream of food labels.
                   2. Detect the language spoken by the user or written on the label.
                   3. ALWAYS respond in the EXACT SAME language as the user.
                   4. Be concise and conversational.`
                    }]
                },
                generation_config: {
                    response_modalities: ["AUDIO", "TEXT"],
                    speech_config: {
                        voice_config: { prebuilt_voice_config: { voice_name: "Aoede" } }
                    }
                }
            }
        };
        ws.current?.send(JSON.stringify(setup));
    };

    const sendVideoFrame = (base64Image: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            const msg = {
                realtime_input: {
                    media_chunks: [{
                        mime_type: "image/jpeg",
                        data: base64Image
                    }]
                }
            };
            ws.current.send(JSON.stringify(msg));
        }
    };

    const initAudio = () => {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    };

    const handleServerMessage = async (message: any) => {
        if (message.server_content?.model_turn?.parts) {
            for (const part of message.server_content.model_turn.parts) {
                if (part.inline_data && part.inline_data.mime_type.startsWith('audio/pcm')) {
                    const pcmData = base64ToFloat32(part.inline_data.data);
                    audioQueue.current.push(pcmData);
                    if (!isPlaying.current) {
                        playAudioQueue();
                    }
                }
            }
        }
    };

    const base64ToFloat32 = (base64: string): Float32Array => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }
        return float32Array;
    };

    const playAudioQueue = async () => {
        if (!audioContext.current || audioQueue.current.length === 0) {
            isPlaying.current = false;
            setStatus('connected');
            return;
        }

        isPlaying.current = true;
        setStatus('speaking');
        const audioData = audioQueue.current.shift()!;
        const buffer = audioContext.current.createBuffer(1, audioData.length, 24000);
        buffer.getChannelData(0).set(audioData);

        const source = audioContext.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.current.destination);

        // Simple volume visualization
        const analyser = audioContext.current.createAnalyser();
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            setCurrentVolume(sum / dataArray.length);
            if (isPlaying.current) requestAnimationFrame(updateVolume);
        };
        updateVolume();

        source.onended = () => {
            playAudioQueue();
        };
        source.start();
    };

    return { connect, disconnect, sendVideoFrame, status, currentVolume };
};
