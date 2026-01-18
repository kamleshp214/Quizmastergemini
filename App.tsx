import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { SetupPanel } from './components/SetupPanel';
import { QuizGame } from './components/QuizGame';
import { ResultsView } from './components/ResultsView';
import { Dashboard } from './components/Dashboard';
import { generateQuiz } from './services/geminiService';
import { QuizConfig, QuizQuestion, UserAnswer, AppState, SavedQuiz } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [timerSeconds, setTimerSeconds] = useState<number | undefined>(undefined);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [reviewQuiz, setReviewQuiz] = useState<SavedQuiz | null>(null);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true; // Default to dark
  });

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Load quizzes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('QUIZMASTER_HISTORY');
      if (saved) {
        setSavedQuizzes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save quizzes
  useEffect(() => {
    localStorage.setItem('QUIZMASTER_HISTORY', JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  const handleStartQuiz = async (config: QuizConfig) => {
    setIsLoading(true);
    setAppState('GENERATING');
    setErrorToast(null);
    setCurrentTopic(config.topic);
    setTimerSeconds(config.timerSeconds);

    try {
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setAppState('QUIZ');
    } catch (error: any) {
      console.error(error);
      setErrorToast(error.message || "Failed to generate quiz. Please try again.");
      setAppState('SETUP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setUserAnswers(answers);
    
    // Save Result
    const score = Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100);
    const newResult: SavedQuiz = {
      id: Date.now().toString(),
      topic: currentTopic,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      questions: questions,
      answers: answers
    };

    setSavedQuizzes(prev => [newResult, ...prev]);
    setAppState('RESULTS');
  };

  const handleDeleteQuiz = (id: string) => {
    setSavedQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const handleReviewQuiz = (quiz: SavedQuiz) => {
    setReviewQuiz(quiz);
    setQuestions(quiz.questions);
    setUserAnswers(quiz.answers);
    setCurrentTopic(quiz.topic);
    setAppState('RESULTS');
  };

  const handleBackToDashboard = () => {
    setAppState('DASHBOARD');
    setQuestions([]);
    setUserAnswers([]);
    setReviewQuiz(null);
    setErrorToast(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-100 transition-opacity duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-300/30 dark:bg-blue-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-primary-300/30 dark:bg-primary-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="glass-dark border-b border-gray-200 dark:border-white/5 sticky top-0 z-50 backdrop-blur-md transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={handleBackToDashboard}
            >
              <div className="bg-gradient-to-tr from-primary-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-slate-800 dark:text-white">
                QuizMaster
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium">
                {appState === 'DASHBOARD' && 'Your Learning Hub'}
                {appState === 'SETUP' && 'Create New Quiz'}
                {appState === 'QUIZ' && 'Quiz in Progress'}
                {appState === 'RESULTS' && 'Performance Review'}
              </div>

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden md:block"></div>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow py-8 md:py-12">
          {/* Global Error Toast */}
          <AnimatePresence>
            {errorToast && (
              <motion.div
                initial={{ opacity: 0, y: -50, x: '-50%' }}
                animate={{ opacity: 1, y: 20, x: '-50%' }}
                exit={{ opacity: 0 }}
                className="fixed top-0 left-1/2 z-50 bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-red-500/50 flex items-center gap-3"
              >
                <span>⚠️ {errorToast}</span>
                <button onClick={() => setErrorToast(null)} className="hover:bg-red-700/50 rounded-full p-1 transition-colors">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            
            {appState === 'DASHBOARD' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard 
                  savedQuizzes={savedQuizzes}
                  onNewQuiz={() => setAppState('SETUP')}
                  onReviewQuiz={handleReviewQuiz}
                  onDeleteQuiz={handleDeleteQuiz}
                />
              </motion.div>
            )}

            {appState === 'SETUP' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-4"
              >
                <SetupPanel 
                  onStartQuiz={handleStartQuiz} 
                  isLoading={isLoading} 
                  onBack={handleBackToDashboard}
                />
              </motion.div>
            )}

            {appState === 'GENERATING' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-8"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-4xl font-display font-bold text-slate-800 dark:text-white mb-2">Crafting Your Quiz</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md">Our AI is analyzing your content to generate challenging questions...</p>
              </motion.div>
            )}

            {appState === 'QUIZ' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <QuizGame 
                  questions={questions} 
                  timerSeconds={timerSeconds}
                  onComplete={handleQuizComplete} 
                  onExit={handleBackToDashboard}
                />
              </motion.div>
            )}

            {appState === 'RESULTS' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultsView 
                  topic={currentTopic}
                  questions={questions} 
                  answers={userAnswers} 
                  onBackToDashboard={handleBackToDashboard}
                  isReviewMode={!!reviewQuiz}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;