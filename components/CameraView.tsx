import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Zap, ZapOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
    const webcamRef = useRef<Webcam>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [flashMode, setFlashMode] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
        }
    }, [webcamRef, onCapture]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const toggleFlash = () => {
        // Note: Flash control via JS is limited/experimental in many browsers
        // We'll just toggle state for now, implementation depends on advanced constraints
        setFlashMode(prev => !prev);
    };

    const videoConstraints = {
        facingMode: facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                <button onClick={onClose} className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm">
                    <X size={24} />
                </button>
                <button onClick={toggleFlash} className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm">
                    {flashMode ? <Zap size={24} className="text-yellow-400" /> : <ZapOff size={24} />}
                </button>
            </div>

            {/* Camera Feed */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="absolute inset-0 w-full h-full object-cover"
                    mirrored={facingMode === 'user'}
                />

                {/* Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[80%] aspect-[3/4] border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-lg"></div>

                        <p className="absolute -bottom-12 left-0 right-0 text-center text-white/80 text-sm font-medium bg-black/40 py-1 rounded-full backdrop-blur-md">
                            Align Nutrition Label Here
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex justify-around items-center bg-gradient-to-t from-black/80 to-transparent">
                <div className="w-12"></div> {/* Spacer */}

                <button
                    onClick={capture}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-95 transition-transform"
                >
                    <div className="w-16 h-16 bg-white rounded-full"></div>
                </button>

                <button onClick={toggleCamera} className="p-3 rounded-full bg-black/40 text-white backdrop-blur-sm active:rotate-180 transition-transform duration-300">
                    <RefreshCw size={24} />
                </button>
            </div>
        </div>
    );
};
