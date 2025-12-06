import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SugarCountProps {
    grams: number;
    cubes: number;
}

const SugarCubeIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M7 2H17C18.1046 2 19 2.89543 19 4V14C19 15.1046 18.1046 16 17 16H7C5.89543 16 5 15.1046 5 14V4C5 2.89543 5.89543 2 7 2Z" fillOpacity="0.8" />
        <path d="M7 16H17V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V16Z" fillOpacity="0.4" />
        <path d="M19 4H21C22.1046 4 23 4.89543 23 6V12C23 13.1046 22.1046 14 21 14H19V4Z" fillOpacity="0.6" />
    </svg>
);

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
                <span className="text-2xl"></span> {t('sugar cubes') || "Total Sugar Load"}
            </h3>

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 items-end min-h-[60px]">
                    {Array.from({ length: fullCubes }).map((_, i) => (
                        <div key={`cube-${i}`} className={`w-8 h-8 ${colorClass} transition-all hover:scale-110`} title="4g sugar">
                            <SugarCubeIcon className="w-full h-full drop-shadow-lg" />
                        </div>
                    ))}
                    {hasPartial && (
                        <div className={`w-8 h-8 ${colorClass} opacity-50 relative`} title="Partial cube">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
                                <SugarCubeIcon className="w-full h-full2" />
                            </div>
                            {/* Simplified partial visualization: just smaller or faded */}
                            <SugarCubeIcon className="w-6 h-6" />
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
