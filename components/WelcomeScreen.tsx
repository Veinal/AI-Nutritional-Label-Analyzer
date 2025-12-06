
import React from 'react';

import { useLanguage } from '../contexts/LanguageContext';

type WelcomeScreenProps = {
    children: React.ReactNode;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ children }) => {
    const { t } = useLanguage();
    return (
        <div className="w-full max-w-4xl mx-auto p-8 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                {t('welcomeTitle')}
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                {t('welcomeText')}
            </p>
            {children}
        </div>
    );
};
