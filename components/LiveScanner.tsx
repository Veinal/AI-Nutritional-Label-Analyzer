import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { X, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveScannerProps {
    onClose: () => void;
}

export const LiveScanner: React.FC<LiveScannerProps> = ({ onClose }) => {
    const webcamRef = useRef<Webcam>(null);
    const { connect, disconnect, sendVideoFrame, status, currentVolume } = useGeminiLive();

    useEffect(() => {
        connect();
        return () => disconnect();
    }, []);

    useEffect(() => {
        // Send a frame every 1 second (balance latency vs bandwidth)
        const interval = setInterval(() => {
            if (webcamRef.current && status === 'connected' || status === 'speaking') {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    // Remove header to get raw base64
                    const base64Data = imageSrc.split(',')[1];
                    sendVideoFrame(base64Data);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, sendVideoFrame]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="relative flex-grow">
                <Webcam
                    ref={webcamRef}
                    audio={true} // Capture user audio for questions
                    className="h-full w-full object-cover"
                    videoConstraints={{ facingMode: "environment" }}
                    screenshotFormat="image/jpeg"
                />

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'speaking' ? 'bg-blue-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-white font-semibold drop-shadow-md">
                            {status === 'connected' ? "Gemini Live" : status === 'speaking' ? "Gemini Speaking" : "Connecting..."}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm">
                        <X size={24} />
                    </button>
                </div>

                {/* Live Overlay / Visualizer */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
                    {status === 'speaking' && (
                        <motion.div
                            animate={{ scale: 1 + currentVolume / 50 }}
                            className="w-16 h-16 rounded-full bg-blue-500/80 blur-xl mb-4"
                        />
                    )}
                    <p className="text-white/80 text-center font-medium">
                        {status === 'speaking' ? "Listening..." : "Point at a label and ask questions."}
                    </p>
                </div>
            </div>
        </div>
    );
};
