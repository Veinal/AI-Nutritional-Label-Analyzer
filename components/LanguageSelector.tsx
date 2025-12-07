import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { languages, Language } from '../utils/translations';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="relative inline-block text-left">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="block w-full px-4 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
