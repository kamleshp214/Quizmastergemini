import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, BookOpen, Clock, Flame } from 'lucide-react';
import { QuizQuestion, UserAnswer } from '../types';
import { Button, cn } from './ui/Button';

interface QuizGameProps {
  questions: QuizQuestion[];
  timerSeconds?: number;
  onComplete: (answers: UserAnswer[]) => void;
  onExit: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, timerSeconds, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);
  const [streak, setStreak] = useState(0);
  
  // Use ReturnType<typeof setInterval> to be environment-agnostic (handles number in browser vs NodeJS.Timeout)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    if (timerSeconds && !isAnswered) {
      setTimeLeft(timerSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, timerSeconds, isAnswered]);

  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleOptionClick('__TIMEOUT__', false); // Special identifier for timeout
  };

  const handleOptionClick = (option: string, userInitiated = true) => {
    if (isAnswered) return;
    
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    
    // Update streak
    if (isCorrect) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedOption: userInitiated ? option : 'Time Out',
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };

    setAnswers(prev => [...prev, newAnswer]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(answers);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-red-500 text-sm font-medium">
          Exit Quiz
        </button>
        
        {streak > 1 && (
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full"
           >
             <Flame className="w-4 h-4 fill-orange-500" />
             {streak} Streak!
           </motion.div>
        )}
      </div>

      {/* Progress & Timer Header */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          {timerSeconds && (
             <span className={cn("flex items-center gap-1", timeLeft < 10 ? "text-red-600 font-bold" : "text-gray-600")}>
               <Clock className="w-4 h-4" /> {timeLeft}s
             </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative">
           {/* Timer progress overlay (if active) */}
           {timerSeconds && !isAnswered && (
             <motion.div 
               className="absolute top-0 left-0 h-full bg-red-400 opacity-30 z-10"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: timerSeconds, ease: "linear" }}
             />
           )}
           <motion.div 
            className="h-full bg-primary-600 rounded-full relative z-20"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                let stateStyle = "border-gray-200 hover:border-primary-400 hover:bg-gray-50";
                
                if (isAnswered) {
                  if (isCorrect) {
                    stateStyle = "bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500";
                  } else if (isSelected && !isCorrect) {
                    stateStyle = "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500";
                  } else {
                    stateStyle = "opacity-50 border-gray-200";
                  }
                } else if (isSelected) {
                   stateStyle = "border-primary-500 bg-primary-50 ring-1 ring-primary-500";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                      stateStyle
                    )}
                  >
                    <span className="font-medium text-lg">{option}</span>
                    {isAnswered && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                    {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation Card (Revealed after answer) */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "p-5 rounded-xl border mb-6 flex gap-4",
                    selectedOption === currentQuestion.correctAnswer 
                      ? "bg-green-50 border-green-200" 
                      : "bg-blue-50 border-blue-200"
                  )}>
                    <div className={cn(
                       "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        selectedOption === currentQuestion.correctAnswer ? "bg-green-200 text-green-700" : "bg-blue-200 text-blue-700"
                    )}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                       <h4 className={cn("font-bold mb-1", selectedOption === currentQuestion.correctAnswer ? "text-green-800" : "text-blue-800")}>
                         Explanation
                       </h4>
                       <p className={cn("text-sm leading-relaxed", selectedOption === currentQuestion.correctAnswer ? "text-green-700" : "text-blue-700")}>
                         {currentQuestion.explanation}
                       </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNext} size="lg" className="pl-6 pr-4 shadow-lg shadow-primary-500/20">
                      {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
