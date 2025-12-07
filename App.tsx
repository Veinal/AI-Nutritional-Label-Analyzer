import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ChatWidget } from './components/ChatWidget';
import { Spinner } from './components/Spinner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CameraView } from './components/CameraView';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { ChatHistory } from './components/ChatHistory';
import { Camera, LogIn } from 'lucide-react';
import { LiveMode } from './components/LiveMode';
import { Camera, Mic } from 'lucide-react';
import * as aiService from './services/aiService';
import { AnalysisResult, ChatMessage, AppState, ChatSession } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageSelector } from './components/LanguageSelector';
import { createChatSession, saveChatMessage, ChatHistory as ChatHistoryType } from './services/databaseService';
import { UserMenu } from './components/UserMenu';

declare global {
  interface Window {
    Tesseract: any;
  }
}

const AppContent: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isOcrReady, setIsOcrReady] = useState(false);
  const [serviceProvider, setServiceProvider] = useState<'Gemini' | 'OpenAI' | 'None'>('None');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const { t, language } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    setServiceProvider(aiService.getAvailableServiceProvider());
  }, []);

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
    setLoadingMessage(t('loadingOcr'));
    setError(null);
    setAnalysis(null);
    setOcrText(null);
    setMessages([]);
    setChatSession(null);

    try {
      const worker = await window.Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = (m.progress * 100).toFixed(0);
            setLoadingMessage(`${t('loadingOcr')} ${progress}%`);
          }
        },
      });
      const ret = await worker.recognize(file);
      await worker.terminate();

      const extractedText = ret.data.text;
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error(t('ocrError'));
      }
      setOcrText(extractedText);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown OCR error occurred.");
      setAppState(AppState.ERROR);
    }
  }, [isOcrReady, t]);

  const processOcrText = useCallback(async (text: string) => {
    setAppState(AppState.ANALYZING);
    setLoadingMessage(t('loadingAnalysis'));
    try {
      // Pass language to analysis service
      const result = await aiService.analyzeNutritionLabel(text, language);
      setAnalysis(result);

      // Create chat session in database if user is logged in
      let sessionId: string | null = null;
      if (user) {
        sessionId = await createChatSession(result.productName, text, result);
        setCurrentSessionId(sessionId);
      }

      // Pass language to chat service
      const chat = await aiService.startChatSession(text, language);
      setChatSession(chat);
      const welcomeMessage = { role: 'model' as const, content: t('chatWelcome') };
      setMessages([welcomeMessage]);
      
      // Save welcome message to database
      if (sessionId) {
        await saveChatMessage(sessionId, welcomeMessage);
      }
      
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('analysisError'));
      setAppState(AppState.ERROR);
    }
  }, [language, t, user]);

  const processImage = useCallback(async (imageSrc: string) => {
    setAppState(AppState.ANALYZING);
    setLoadingMessage('AI is analyzing the label directly...');
    setImageUrl(imageSrc); // Set the captured image for display

    try {
      // Extract base64 data
      const base64Data = imageSrc.split(',')[1];
      const mimeType = imageSrc.split(';')[0].split(':')[1];

      const result = await aiService.analyzeNutritionLabel({ image: base64Data, mimeType }, language);
      setAnalysis(result);

      // Create chat session in database if user is logged in
      let sessionId: string | null = null;
      if (user) {
        sessionId = await createChatSession(result.productName, null, result);
        setCurrentSessionId(sessionId);
      }

      // For chat context, we might need OCR or just pass a generic message if the chat model doesn't support images in history yet
      // Ideally, we'd pass the image to the chat model too, but for now let's use the analysis summary as context
      const context = `Product: ${result.productName}. Summary: ${result.summary}. Pros: ${result.pros.join(', ')}. Cons: ${result.cons.join(', ')}`;
      const chat = await aiService.startChatSession(context, language);

      setChatSession(chat);
      const welcomeMessage = { role: 'model' as const, content: t('chatWelcome') };
      setMessages([welcomeMessage]);
      
      // Save welcome message to database
      if (sessionId) {
        await saveChatMessage(sessionId, welcomeMessage);
      }
      
      setAppState(AppState.RESULTS);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An AI analysis error occurred.");
      setAppState(AppState.ERROR);
    }
  }, [language, t, user]);

  useEffect(() => {
    if (ocrText && appState === AppState.PROCESSING_OCR) {
      processOcrText(ocrText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrText, processOcrText]);


  const handleSendMessage = async (userMessage: string) => {
    if (!chatSession) return;

    const userMsg: ChatMessage = { role: 'user', content: userMessage };
    const newMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(newMessages);
    setAppState(AppState.CHATTING);

    // Save user message to database
    if (currentSessionId) {
      await saveChatMessage(currentSessionId, userMsg);
    }

    try {
      const modelResponse = await chatSession.sendMessage(userMessage);
      const modelMsg: ChatMessage = { role: 'model', content: modelResponse };
      setMessages([...newMessages, modelMsg]);
      
      // Save model response to database
      if (currentSessionId) {
        await saveChatMessage(currentSessionId, modelMsg);
      }

    } catch (err) {
      console.error(err);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      const errorMsg: ChatMessage = { role: 'model', content: errorMessage };
      setMessages(prev => [...prev, errorMsg]);
      
      // Save error message to database
      if (currentSessionId) {
        await saveChatMessage(currentSessionId, errorMsg);
      }
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
    setCurrentSessionId(null);
    setAppState(AppState.WELCOME);
    setLoadingMessage('');
    setError(null);
  };

  const handleLoadChatSession = (session: ChatHistoryType) => {
    setAnalysis(session.analysis_data);
    setMessages(session.messages || []);
    setCurrentSessionId(session.id);
    setOcrText(session.ocr_text);
    setAppState(AppState.RESULTS);
    
    // Recreate chat session with the OCR text or analysis data
    const context = session.ocr_text || 
      (session.analysis_data ? 
        `Product: ${session.analysis_data.productName}. Summary: ${session.analysis_data.summary}` : 
        '');
    
    if (context) {
      aiService.startChatSession(context, language).then(chat => {
        setChatSession(chat);
      });
    }
  };

  const renderContent = () => {
    if (serviceProvider === 'None') {
      return (
        <div className="text-center p-8 bg-red-900/50 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h2>
          <p className="text-gray-200 mb-6">
            No AI provider API key found. Please add either <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> to your <code>.env.local</code> file.
          </p>
        </div>
      );
    }

    switch (appState) {
      case AppState.CAMERA:
        return (
          <CameraView
            onCapture={processImage}
            onClose={() => setAppState(AppState.WELCOME)}
          />
        );
      case AppState.LIVE_MODE:
        return (
          <LiveMode
            onClose={() => setAppState(AppState.RESULTS)}
            chatSession={chatSession}
            onMessage={(role, content) => {
              setMessages(prev => [...prev, { role, content }]);
            }}
          />
        );
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
          <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
            <AnalysisDisplay
              analysis={analysis}
              imageUrl={imageUrl}
              onReset={handleReset}
            />
            <ChatWidget
              messages={messages}
              onSendMessage={handleSendMessage}
              isResponding={appState === AppState.CHATTING}
              onEnterLiveMode={() => setAppState(AppState.LIVE_MODE)}
            />
          </div>
        );
      case AppState.ERROR:
        return (
          <div className="text-center p-8 bg-red-900/50 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-400 mb-4">{t('errorTitle')}</h2>
            <p className="text-gray-200 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              {t('tryAgain')}
            </button>
          </div>
        );
      case AppState.WELCOME:
      default:
        return (
          <WelcomeScreen>
            <div className="flex flex-col gap-4 w-full max-w-md">
              <button
                onClick={() => setAppState(AppState.CAMERA)}
                className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Camera size={24} />
                <span>Scan Label with Camera</span>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <ImageUploader onImageUpload={handleImageUpload} isOcrReady={isOcrReady} />
            </div>
          </WelcomeScreen>
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center">
      <header className="w-full p-4 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            {t('appTitle')}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{t('appSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          {user && (
             <UserMenu
                onShowHistory={() => setShowChatHistory(true)}
                onShowProfile={() => setShowUserProfile(true)}
                onSignOut={signOut}
              />
          )}
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>
      <main className="flex-grow w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      <footer className="w-full p-4 text-center text-gray-500 text.sm">
        <p>{t('appTitle')}</p>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
      <ChatHistory
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        onLoadSession={handleLoadChatSession}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
