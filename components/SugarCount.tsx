import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CubeIcon } from './Icon';

interface SugarCountProps {
    grams: number;
    cubes: number;
}

export const SugarCount: React.FC<SugarCountProps> = ({ grams, cubes }) => {
    const { t } = useLanguage();

    // Create an array for rendering cubes
    const fullCubes = Math.floor(cubes);
    const hasPartial = cubes % 1 !== 0;

    // Logic to determine color based on amount - high sugar = red warning
    const isHighSugar = grams > 20;
    const colorClass = isHighSugar ? "text-red-400" : "text-white";

    return (
        <div className="bg-gray-900/40 p-6 rounded-2xl border border-white/5 shadow-inner backdrop-blur-sm transition-all hover:bg-gray-900/60">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6 flex items-center gap-2">
                {t('sugar cubes') || "SUGAR COUNT"}
            </h3>

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-2 items-end min-h-[60px] p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                    {Array.from({ length: fullCubes }).map((_, i) => (
                        <div key={`cube-${i}`} className={`w-8 h-8 ${colorClass} transition-all hover:scale-110 transform`} title="4g sugar">
                            <CubeIcon className="w-full h-full drop-shadow-md" />
                        </div>
                    ))}
                    {hasPartial && (
                        <div className={`w-8 h-8 ${colorClass} opacity-50 relative transition-all hover:scale-110 transform`} title="Partial cube">
                            <CubeIcon className="w-full h-full drop-shadow-md" />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            {grams}<span className="text-lg text-gray-500 ml-1">g</span>
                        </span>
                        <span className="text-xs text-gray-400 font-medium mt-1">Total Sugar</span>
                    </div>

                    <div className="h-8 w-px bg-gray-700/50 mx-4"></div>

                    <div className="flex flex-col items-end">
                        <span className="text-3xl font-extrabold text-white tracking-tight">
                            {cubes}
                        </span>
                        <span className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{t('cubes') || "Cubes"}</span>
                    </div>
                </div>

                {isHighSugar && (
                    <div className="mt-2 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wide">High Sugar Content</span>
                    </div>
                )}
            </div>
        </div>
    );
};
