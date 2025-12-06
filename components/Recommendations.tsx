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
        <div className="mt-8">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-xl">🌿</span>
                {t('Healthier Alternatives') || "healthier Alternatives"}
            </h3>

            <div className="grid gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-800/40 to-gray-800/20 p-5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all hover:bg-gray-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 group">
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 text-emerald-400 font-extrabold text-xl shadow-inner">
                                {item.score}
                            </div>
                        </div>

                        <div className="flex-grow">
                            <h4 className="font-bold text-gray-100 text-lg group-hover:text-emerald-300 transition-colors">{item.name}</h4>
                            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{item.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};
