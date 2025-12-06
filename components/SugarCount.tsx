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
        <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm shadow-xl animate-fade-in-up">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CubeIcon className="w-6 h-6 text-white" /> {t('sugar cubes') || "Total Sugar Load"}
            </h3>

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-end min-h-[60px]">
                    {Array.from({ length: fullCubes }).map((_, i) => (
                        <div key={`cube-${i}`} className={`w-8 h-8 ${colorClass} transition-all hover:scale-110`} title="4g sugar">
                            <CubeIcon className="w-full h-full drop-shadow-lg" />
                        </div>
                    ))}
                    {hasPartial && (
                        <div className={`w-8 h-8 ${colorClass} opacity-50 relative`} title="Partial cube">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
                                <CubeIcon className="w-full h-full2" />
                            </div>
                            {/* Simplified partial visualization: just smaller or faded */}
                            <CubeIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-gray-600/50">
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {grams}g
                    </div>
                    <div className="text-sm text-gray-400 font-medium">
                        ≈ {cubes} {t('cubes') || "cubes"}
                    </div>
                </div>

                {isHighSugar && (
                    <div className="text-xs bg-red-500/10 text-red-300 px-3 py-1.5 rounded-full self-start flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                        High Sugar Content
                    </div>
                )}
            </div>
        </div>
    );
};
