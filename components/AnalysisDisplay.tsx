import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { SugarCount } from './SugarCount';
import { Recommendations } from './Recommendations';

interface AnalysisDisplayProps {
    analysis: AnalysisResult | null;
    imageUrl: string | null;
    onReset: () => void;
}

const HealthScore: React.FC<{ score: number, explanation?: string }> = ({ score, explanation }) => {
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
        <div className="flex flex-col items-center">
            <div className={`relative w-40 h-40 rounded-full flex items-center justify-center bg-gray-800 ring-8 ${getRingColor(score)} shadow-2xl mb-4 transition-all duration-1000 transform hover:scale-105`}>
                <span className={`text-6xl font-bold ${getColor(score)} tabular-nums`}>{displayScore}</span>
                <span className="absolute bottom-6 text-sm text-gray-400 font-medium">/ 100</span>
            </div>
            {explanation && (
                <p className="text-gray-400 text-sm max-w-xs text-center italic bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
                    "{explanation}"
                </p>
            )}
        </div>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, imageUrl, onReset }) => {
    const { t } = useLanguage();

    if (!analysis) return null;

    return (
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl flex flex-col h-full max-h-[85vh] overflow-y-auto animate-fade-in-scale-up custom-scrollbar">
            <div className="flex justify-between items-start mb-6 sticky top-0 bg-gray-900/90 p-4 -m-4 rounded-t-2xl z-10 backdrop-blur-md border-b border-gray-700/50">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 truncate pr-4">{analysis.productName}</h2>
                <button
                    onClick={onReset}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all hover:shadow-lg hover:ring-2 hover:ring-emerald-500/50 text-sm whitespace-nowrap"
                >
                    {t('newScan')}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* Left Column: Image & Score */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {imageUrl && (
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <img src={imageUrl} alt="Nutrition label" className="relative w-full h-64 object-cover rounded-lg shadow-xl ring-1 ring-gray-700/50" />
                        </div>
                    )}

                    <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 shadow-inner flex flex-col items-center">
                        <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-400 mb-4">{t('healthScore')}</h3>
                        <HealthScore score={analysis.healthScore} explanation={analysis.healthScoreExplanation} />
                    </div>

                    {/* Sugar Count Visualization */}
                    {analysis.sugarContent && (
                        <SugarCount grams={analysis.sugarContent.grams} cubes={analysis.sugarContent.cubes} />
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="w-full lg:w-2/3 space-y-8">
                    <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/30">
                        <h3 className="text-xl font-bold text-gray-200 mb-2">Summary</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
                            <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2" /> {t('pros')}</h3>
                            <ul className="space-y-3">
                                {analysis.pros.map((pro, i) => (
                                    <li key={i} className="flex items-start text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-2 flex-shrink-0"></span>
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-900/10 p-5 rounded-xl border border-red-500/20">
                            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center"><XCircleIcon className="w-6 h-6 mr-2" /> {t('cons')}</h3>
                            <ul className="space-y-3">
                                {analysis.cons.map((con, i) => (
                                    <li key={i} className="flex items-start text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                                        {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🧬</span> {t('ingredients')}
                        </h3>
                        <div className="grid gap-3">
                            {analysis.ingredientsAnalysis.map((item, i) => (
                                <div key={i} className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <strong className="text-white text-lg">{item.ingredient}</strong>
                                        {item.isGood ?
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30 font-medium">Safe</span> :
                                            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30 font-medium">Attention</span>
                                        }
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Healthier Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <Recommendations items={analysis.recommendations} />
                    )}
                </div>
            </div>
        </div >
    );
};