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

    const getGradient = (s: number) => {
        if (s > 75) return 'from-emerald-500/20 to-emerald-900/5 stroke-emerald-500';
        if (s > 50) return 'from-yellow-500/20 to-yellow-900/5 stroke-yellow-500';
        return 'from-red-500/20 to-red-900/5 stroke-red-500';
    }

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4 transition-transform duration-500 hover:scale-105">
                {/* SVG Ring Background */}
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-800"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`transition-all duration-300 ease-out ${getGradient(score)}`}
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        className={`fill-current opacity-10 ${getColor(score).replace('text-', 'text-')}`}
                    />
                </svg>

                <div className="relative flex flex-col items-center">
                    <span className={`text-5xl font-extrabold ${getColor(score)} tabular-nums tracking-tighter filter drop-shadow-lg`}>{displayScore}</span>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Score</span>
                </div>
            </div>

            {explanation && (
                <p className="text-gray-400 text-sm max-w-xs text-center leading-relaxed backdrop-blur-sm bg-gray-800/20 p-4 rounded-xl border border-white/5">
                    {explanation}
                </p>
            )}
        </div>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, imageUrl, onReset }) => {
    const { t } = useLanguage();

    if (!analysis) return null;

    return (
        <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col animate-fade-in-scale-up border border-gray-700/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-700/50">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
                        {analysis.productName}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Nutritional Analysis</p>
                </div>
                <button
                    onClick={onReset}
                    className="group flex items-center gap-2 bg-gray-700/50 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-semibold py-2.5 px-6 rounded-full transition-all border border-emerald-500/30 hover:border-emerald-500/60"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4a14.95 14.95 0 0115.013 9.497M20 20a14.95 14.95 0 01-15.013-9.497" />
                    </svg>
                    {t('newScan')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: Visuals & Metrics (4 columns wide) */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {imageUrl && (
                        <div className="relative group rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                            <img
                                src={imageUrl}
                                alt="Nutrition label"
                                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    )}

                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex flex-col items-center text-center">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">{t('healthScore')}</h3>
                            <HealthScore score={analysis.healthScore} explanation={analysis.healthScoreExplanation} />
                        </div>
                    </div>

                    {analysis.sugarContent && (
                        <SugarCount grams={analysis.sugarContent.grams} cubes={analysis.sugarContent.cubes} />
                    )}
                </div>

                {/* Right Column: Detailed Analysis (8 columns wide) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-8 rounded-2xl border border-gray-700/50 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2 relative z-10">
                            Summary
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg relative z-10">
                            {analysis.summary}
                        </p>
                    </div>

                    {/* Pros & Cons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-900/10 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                {t('pros')}
                            </h3>
                            <ul className="space-y-3">
                                {analysis.pros.map((pro, i) => (
                                    <li key={i} className="flex items-start text-gray-300 text-sm leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-900/10 backdrop-blur-sm p-6 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-colors">
                            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                <XCircleIcon className="w-5 h-5" />
                                {t('cons')}
                            </h3>
                            <ul className="space-y-3">
                                {analysis.cons.map((con, i) => (
                                    <li key={i} className="flex items-start text-gray-300 text-sm leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                                        {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-xl">🧬</span>
                            {t('ingredients')}
                        </h3>

                        <div className="grid gap-4">
                            {(!analysis.ingredientsAnalysis || analysis.ingredientsAnalysis.length === 0) ? (
                                <div className="bg-gray-800/30 p-12 rounded-2xl border border-gray-700/30 text-center flex flex-col items-center justify-center gap-4">
                                    <span className="text-5xl opacity-30 grayscale">🥗</span>
                                    <div className="space-y-1">
                                        <p className="text-gray-300 font-medium text-lg">{t('no Ingredients Found') || "No specific ingredients analyzed"}</p>
                                        <p className="text-gray-500 text-sm">We couldn't find detailed ingredient information for this product.</p>
                                    </div>
                                </div>
                            ) : (
                                analysis.ingredientsAnalysis.map((item, i) => (
                                    <div key={i} className="group bg-gray-800/30 hover:bg-gray-800/60 p-5 rounded-2xl transition-all border border-gray-700/30 hover:border-gray-600/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <strong className="text-gray-100 text-lg tracking-wide group-hover:text-cyan-400 transition-colors">{item.ingredient}</strong>
                                            {item.isGood ?
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider self-start sm:self-auto">Safe</span> :
                                                <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20 font-bold uppercase tracking-wider self-start sm:self-auto">Attention</span>
                                            }
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-gray-700 pl-3 group-hover:border-cyan-500/50 transition-colors">{item.explanation}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Healthier Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <Recommendations items={analysis.recommendations} />
                    )}
                </div>
            </div>
        </div>
    );
};