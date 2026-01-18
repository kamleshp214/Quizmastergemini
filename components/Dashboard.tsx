import React from 'react';
import { motion } from 'framer-motion';
import { Plus, History, Trophy, ArrowRight, BrainCircuit, Trash2, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { SavedQuiz } from '../types';

interface DashboardProps {
  savedQuizzes: SavedQuiz[];
  onNewQuiz: () => void;
  onReviewQuiz: (quiz: SavedQuiz) => void;
  onDeleteQuiz: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ savedQuizzes, onNewQuiz, onReviewQuiz, onDeleteQuiz }) => {
  // Calculate aggregate stats
  const totalQuizzes = savedQuizzes.length;
  const avgScore = totalQuizzes > 0 
    ? Math.round(savedQuizzes.reduce((acc, q) => acc + q.score, 0) / totalQuizzes) 
    : 0;
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 p-8 md:p-10 text-white shadow-2xl shadow-primary-900/20 dark:shadow-primary-900/50"
        >
          <div className="relative z-10 flex flex-col h-full justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-6">
                <Zap className="w-3 h-3 text-yellow-300" /> AI-Powered Learning
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
                Master Any Topic <br /> in Seconds
              </h1>
              <p className="text-primary-100 text-lg mb-8 max-w-lg leading-relaxed">
                Upload documents or paste text. Our AI generates interactive quizzes with detailed explanations to boost your retention.
              </p>
            </div>
            <Button 
              onClick={onNewQuiz} 
              className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-xl shadow-black/10 font-bold px-8 py-4 text-lg rounded-2xl transition-transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" /> Create New Quiz
            </Button>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute bottom-0 right-0 opacity-20 transform translate-x-12 translate-y-12 pointer-events-none">
            <BrainCircuit className="w-80 h-80" />
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-dark rounded-3xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-600 dark:text-slate-300 font-medium">Your Performance</h3>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="space-y-6">
               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 transition-colors">
                 <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Total Quizzes</p>
                 <p className="text-3xl font-display font-bold text-slate-800 dark:text-white">{totalQuizzes}</p>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 transition-colors">
                 <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Avg. Score</p>
                 <div className="flex items-baseline gap-2">
                   <p className={`text-3xl font-display font-bold ${avgScore >= 70 ? 'text-green-600 dark:text-green-400' : avgScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-200'}`}>
                     {avgScore}%
                   </p>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-slate-500 text-center">
            Keep learning to improve your stats!
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <History className="w-5 h-5 text-slate-400" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Recent Activity</h3>
      </div>

      {savedQuizzes.length === 0 ? (
        <div className="text-center py-16 glass-dark rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <BrainCircuit className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">No quizzes taken yet. Start your journey!</p>
          <Button variant="outline" onClick={onNewQuiz}>Start your first quiz</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group glass-dark rounded-2xl p-6 hover:shadow-lg dark:hover:bg-slate-800/80 transition-all duration-300 flex flex-col border border-slate-200 dark:border-white/5 hover:border-primary-200 dark:hover:border-primary-500/30"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider truncate max-w-[70%]">
                  {quiz.topic}
                </div>
                <div className={`text-lg font-bold font-display ${
                  quiz.score >= 80 ? 'text-green-600 dark:text-green-400' : 
                  quiz.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {quiz.score}%
                </div>
              </div>

              <div className="flex-1 mb-6">
                <p className="text-slate-400 text-xs mb-1">Completed on</p>
                <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                  {new Date(quiz.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  {quiz.totalQuestions} Questions
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => onReviewQuiz(quiz)} 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-white"
                >
                  Review <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
                <button 
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Result"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};