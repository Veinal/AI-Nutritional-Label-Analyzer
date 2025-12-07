# AI Nutritional Label Analyzer

A powerful, mobile-first web application that leverages Google's **Gemini 2.5 Flash** AI to instantly analyze nutritional labels. It helps users make healthier food choices by providing detailed breakdowns, health scores, and interactive chat capabilities in their native language.

## 🚀 Features

- **Live Camera Scanning**: Seamlessly scan nutrition labels using your device's camera.
- **Multimodal AI Analysis**: Uses Gemini 2.5 Flash to analyze images directly, ensuring high accuracy without relying solely on OCR.
- **Native Multi-Language Support**: The UI and AI responses are fully localized. The AI "thinks" and converses fluently in the user's selected language.
- **Interactive AI Chat**: Ask follow-up questions about ingredients, health benefits, or dietary concerns.
- **Progressive Web App (PWA)**: Installable on mobile devices (iOS/Android) for a native app-like experience.
- **Instant Health Score**: Get a quick 0-100 health rating based on the nutritional profile.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **AI Integration**: Google Generative AI SDK (Gemini 2.5 Flash)
- **Camera**: react-webcam
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

You will also need a **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/AI-Nutritional-Label-Analyzer.git
    cd AI-Nutritional-Label-Analyzer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 📱 Mobile Usage (PWA)

This app is optimized for mobile use. To install it:

1.  Open the app in your mobile browser (Chrome on Android, Safari on iOS).
2.  **Android**: Tap the menu (three dots) -> "Add to Home Screen" or "Install App".
3.  **iOS**: Tap the Share button -> "Add to Home Screen".
4.  Launch the app from your home screen for a full-screen experience.

## 🧪 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Locally previews the production build.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
