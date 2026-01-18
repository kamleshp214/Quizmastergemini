# QuizMaster 🧠

**AI-Powered Quiz Platform built with React, Tailwind CSS, and Google Gemini API.**

QuizMaster allows you to instantly generate interactive quizzes from PDFs, documents, or raw text. It uses Google's advanced Gemini models to create challenging questions, evaluate your answers, and provide detailed study guides to help you improve.

![QuizMaster Preview](https://via.placeholder.com/800x400?text=QuizMaster+Dashboard)

## ✨ Features

- **Document-to-Quiz**: Upload PDF, DOCX, or TXT files to generate quizzes instantly.
- **Customizable**: Choose difficulty levels (Easy to PhD), question types (MCQ, True/False), and question counts.
- **AI Explanations**: Get detailed reasoning for every correct and incorrect answer.
- **Smart Study Guide**: After a quiz, the AI analyzes your mistakes and generates a personalized markdown study guide.
- **Gamification**: Streaks, timers, and celebration confetti!
- **History Tracking**: All your past quizzes and scores are saved locally.
- **Dark/Light Mode**: Beautiful glassmorphism UI with full theme support.
- **Export**: Download your results and study guides as a PDF.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **AI**: Google Gemini API (`@google/genai` SDK)
- **File Parsing**: `pdfjs-dist`, `mammoth`
- **Charts**: Recharts
- **PDF Generation**: jsPDF

## 🚀 Getting Started

### Prerequisites

You need a **Google Gemini API Key**. You can get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/quizmaster.git
    cd quizmaster
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *Note: The app is configured to use `process.env.API_KEY` internally, which maps to this variable in Vite.*

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open `http://localhost:5173` in your browser.

## 📝 Usage

1.  **Dashboard**: See your recent activity and performance stats.
2.  **Create Quiz**: Click "Create New Quiz".
    - **Upload Mode**: Drag & drop a PDF/Doc.
    - **Text Mode**: Paste raw text or notes.
3.  **Configure**: Set difficulty, timer, and question count.
4.  **Play**: Answer questions before the timer runs out!
5.  **Review**: See your score, read explanations, and study the AI-generated guide.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License.
