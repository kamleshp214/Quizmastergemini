import { QuizDifficulty, QuizType } from './types';

export const DEFAULT_QUESTION_COUNT = 10;
export const MIN_QUESTIONS = 5;
export const MAX_QUESTIONS = 20;

export const DIFFICULTY_OPTIONS = [
  { value: QuizDifficulty.EASY, label: 'Easy', color: 'bg-green-100 text-green-700' },
  { value: QuizDifficulty.MEDIUM, label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: QuizDifficulty.HARD, label: 'Hard', color: 'bg-orange-100 text-orange-700' },
  { value: QuizDifficulty.PHD, label: 'PhD Level', color: 'bg-red-100 text-red-700' },
];

export const TYPE_OPTIONS = [
  { value: QuizType.MCQ, label: 'Multiple Choice' },
  { value: QuizType.TRUE_FALSE, label: 'True / False' },
  { value: QuizType.MIXED, label: 'Mixed' },
];

export const GEMINI_MODEL = 'gemini-2.5-flash-latest';
