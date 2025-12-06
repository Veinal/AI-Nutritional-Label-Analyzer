import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Recommendation {
    name: string;
    score: number;
    reason: string;
}

interface RecommendationsProps {
    items: Recommendation[];
}

export const Recommendations: React.FC<RecommendationsProps> = ({ items }) => {
    const { t } = useLanguage();

    if (!items || items.length === 0) return null;

    return (
        <div className="mt-6 bg-gradient-to-br from-emerald-900/20 to-gray-800/50 p-6 rounded-xl border border-emerald-500/20 animate-fade-in-up delay-100">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌿</span> {t('healthierAlternatives') || "Healthier Alternatives"}
            </h3>

            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-gray-800/80 p-4 rounded-lg hover:bg-gray-800 transition-colors border border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-4 group">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/50 group-hover:border-emerald-400 transition-colors">
                                <span className="font-bold text-emerald-400 text-lg">{item.score}</span>
                            </div>
                        </div>

                        <div className="flex-grow">
                            <h4 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">{item.name}</h4>
                            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.reason}</p>
                        </div>

                        {/* <div className="flex-shrink-0 self-start sm:self-center">
                            <button className="text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
                                View Details
                            </button>
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
    );
};
