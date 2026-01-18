export enum QuizDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  PHD = 'PhD Level'
}

export enum QuizType {
  MCQ = 'Multiple Choice',
  TRUE_FALSE = 'True/False',
  MIXED = 'Mixed'
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizConfig {
  topic: string;
  content: string;
  difficulty: QuizDifficulty;
  type: QuizType;
  questionCount: number;
  timerSeconds?: number; // Optional timer per question
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  date: string; // ISO string
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  answers: UserAnswer[];
}

export type AppState = 'DASHBOARD' | 'SETUP' | 'GENERATING' | 'QUIZ' | 'RESULTS';
