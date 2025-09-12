import React, { useState, useCallback, useEffect } from 'react';
// FIX: Removed unused GoogleGenAI import.
import { Chat } from '@google/genai';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ChatWindow } from './components/ChatWindow';
import { Spinner } from './components/Spinner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { analyzeNutritionLabel, startChatSession } from './services/geminiService';
import { AnalysisResult, ChatMessage, AppState } from './types';

// FIX: Fix TypeScript error for 'window.Tesseract' by augmenting the global Window interface.
// This correctly informs TypeScript that the Tesseract.js library, loaded via a script tag, attaches its API to the window object.
declare global {
  interface Window {
    Tesseract: any;
  }
}

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isOcrReady, setIsOcrReady] = useState(false);

  useEffect(() => {
    const ocrCheckInterval = setInterval(() => {
      if (window.Tesseract) {
        setIsOcrReady(true);
        clearInterval(ocrCheckInterval);
      }
    }, 100);
    return () => clearInterval(ocrCheckInterval);
  }, []);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!isOcrReady) {
      setError("OCR library is still loading. Please wait a moment and try again.");
      setAppState(AppState.ERROR);
      return;
    }

    setImageFile(file);
    setAppState(AppState.PROCESSING_OCR);
    setLoadingMessage('Reading nutrition label...');
    setError(null);
    setAnalysis(null);
    setOcrText(null);
    setMessages([]);
    setChatSession(null);

    try {
      // FIX: Use window.Tesseract to be explicit, matching the type declaration.
      const worker = await window.Tesseract.createWorker('eng', 1, {
          logger: m => {
              if (m.status === 'recognizing text') {
                  const progress = (m.progress * 100).toFixed(0);
                  setLoadingMessage(`Reading nutrition label... ${progress}%`);
              }
          },
      });
      const ret = await worker.recognize(file);
      await worker.terminate();
      
      const extractedText = ret.data.text;
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error("Could not extract sufficient text from the image. Please try a clearer picture.");
      }
      setOcrText(extractedText);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown OCR error occurred.");
      setAppState(AppState.ERROR);
    }
  }, [isOcrReady]);

  const processOcrText = useCallback(async (text: string) => {
    setAppState(AppState.ANALYZING);
    setLoadingMessage('AI is analyzing the nutritional information...');
    try {
      const result = await analyzeNutritionLabel(text);
      setAnalysis(result);
      
      const chat = await startChatSession(text);
      setChatSession(chat);
      setMessages([{ role: 'model', content: "Hello! I've analyzed this food label. Feel free to ask me any questions about its health implications, ingredients, or suitability for your diet." }]);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An AI analysis error occurred.");
      setAppState(AppState.ERROR);
    }
  }, []);

  useEffect(() => {
    if (ocrText && appState === AppState.PROCESSING_OCR) {
        processOcrText(ocrText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrText, processOcrText]);


  const handleSendMessage = async (userMessage: string) => {
    if (!chatSession) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAppState(AppState.CHATTING);
    
    try {
        const stream = await chatSession.sendMessageStream({ message: userMessage });
        
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = modelResponse;
                return newMessages;
            });
        }

    } catch (err) {
        console.error(err);
        const errorMessage = "Sorry, I encountered an error. Please try again.";
        setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
        setAppState(AppState.RESULTS);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setOcrText(null);
    setAnalysis(null);
    setChatSession(null);
    setMessages([]);
    setAppState(AppState.WELCOME);
    setLoadingMessage('');
    setError(null);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.PROCESSING_OCR:
      case AppState.ANALYZING:
        return (
          <div className="text-center p-8">
            <Spinner />
            <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            {imageUrl && <img src={imageUrl} alt="Uploaded label" className="mt-8 mx-auto max-w-sm rounded-lg shadow-lg opacity-50" />}
          </div>
        );
      case AppState.RESULTS:
      case AppState.CHATTING:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full p-4 md:p-8">
            <AnalysisDisplay 
                analysis={analysis} 
                imageUrl={imageUrl} 
                onReset={handleReset}
            />
            <ChatWindow 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isResponding={appState === AppState.CHATTING}
            />
          </div>
        );
      case AppState.ERROR:
         return (
            <div className="text-center p-8 bg-red-900/50 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                <p className="text-gray-200 mb-6">{error}</p>
                <button
                    onClick={handleReset}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
         );
      case AppState.WELCOME:
      default:
        return (
            <WelcomeScreen>
                <ImageUploader onImageUpload={handleImageUpload} isOcrReady={isOcrReady} />
            </WelcomeScreen>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center">
       <header className="w-full p-4 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          AI Nutritional Label Analyzer
        </h1>
        <p className="text-gray-400 mt-1">Upload a nutrition label to get an instant health analysis.</p>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      <footer className="w-full p-4 text-center text-gray-500 text-sm">
        <p>Powered by Google Gemini & Tesseract.js. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
