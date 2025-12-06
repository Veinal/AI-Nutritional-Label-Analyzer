import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icon';

interface AnalysisDisplayProps {
  analysis: AnalysisResult | null;
  imageUrl: string | null;
  onReset: () => void;
}

const HealthScore: React.FC<{ score: number }> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const duration = 1200; // ms

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentScore = Math.floor(progress * score);
            setDisplayScore(currentScore);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        const animationFrameId = window.requestAnimationFrame(step);

        return () => window.cancelAnimationFrame(animationFrameId);
    }, [score]);


    const getColor = (s: number) => {
        if (s > 75) return 'text-emerald-400';
        if (s > 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getRingColor = (s: number) => {
        if (s > 75) return 'ring-emerald-500';
        if (s > 50) return 'ring-yellow-500';
        return 'ring-red-500';
    }

    return (
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center bg-gray-800 ring-4 ${getRingColor(score)} shadow-lg`}>
            <span className={`text-5xl font-bold ${getColor(score)} tabular-nums`}>{displayScore}</span>
            <span className="absolute bottom-4 text-sm text-gray-400">/ 100</span>
        </div>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, imageUrl, onReset }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl flex flex-col h-full max-h-[85vh] overflow-y-auto animate-fade-in-scale-up">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">{analysis.productName}</h2>
            <button 
                onClick={onReset} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
                New Scan
            </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {imageUrl && <img src={imageUrl} alt="Nutrition label" className="w-32 h-32 object-cover rounded-lg shadow-md" />}
            <div className="flex-grow">
                <p className="text-gray-300">{analysis.summary}</p>
            </div>
        </div>

        <div className="text-center mb-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Health Score</h3>
            <HealthScore score={analysis.healthScore} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h3 className="text-xl font-semibold text-emerald-400 mb-3 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2" /> Pros</h3>
                <ul className="space-y-2">
                    {analysis.pros.map((pro, i) => <li key={i} className="bg-gray-700/50 p-3 rounded-lg text-gray-300 animate-fade-in-up" style={{ animationDelay: `${100 * i}ms`}}>{pro}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-red-400 mb-3 flex items-center"><XCircleIcon className="w-6 h-6 mr-2" /> Cons</h3>
                <ul className="space-y-2">
                    {analysis.cons.map((con, i) => <li key={i} className="bg-gray-700/50 p-3 rounded-lg text-gray-300 animate-fade-in-up" style={{ animationDelay: `${100 * i}ms`}}>{con}</li>)}
                </ul>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Ingredient Analysis</h3>
            <ul className="space-y-3">
                {analysis.ingredientsAnalysis.map((item, i) => (
                    <li key={i} className="bg-gray-700/50 p-4 rounded-lg animate-fade-in-up" style={{ animationDelay: `${50 * i}ms`}}>
                        <div className="flex items-center">
                            {item.isGood ? <CheckCircleIcon className="w-5 h-5 mr-3 text-emerald-500 flex-shrink-0"/> : <XCircleIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0"/>}
                            <strong className="text-white">{item.ingredient}</strong>
                        </div>
                        <p className="text-gray-400 pl-8 mt-1 text-sm">{item.explanation}</p>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};