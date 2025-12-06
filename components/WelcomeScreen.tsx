
import React from 'react';

type WelcomeScreenProps = {
    children: React.ReactNode;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ children }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-8 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Unlock the Secrets of Your Food
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Simply upload a picture of any nutrition label, and our AI will instantly break it down for you. Understand ingredients, check for allergens, and get a clear health score to make smarter food choices.
            </p>
            {children}
        </div>
    );
};
