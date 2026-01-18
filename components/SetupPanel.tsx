import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Type, Sliders, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button, cn } from './ui/Button';
import { DIFFICULTY_OPTIONS, TYPE_OPTIONS, DEFAULT_QUESTION_COUNT, MAX_QUESTIONS, MIN_QUESTIONS } from '../constants';
import { QuizConfig, QuizDifficulty, QuizType } from '../types';
import { parseFile } from '../services/fileService';

interface SetupPanelProps {
  onStartQuiz: (config: QuizConfig) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const SetupPanel: React.FC<SetupPanelProps> = ({ onStartQuiz, isLoading, onBack }) => {
  const [mode, setMode] = useState<'upload' | 'topic'>('upload');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(QuizDifficulty.MEDIUM);
  const [type, setType] = useState<QuizType>(QuizType.MCQ);
  const [count, setCount] = useState(DEFAULT_QUESTION_COUNT);
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // 0 = off
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsParsing(true);
    setError('');
    try {
      const text = await parseFile(file);
      setContent(text);
      setFileName(file.name);
      if (!topic) {
        setTopic(file.name.split('.')[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  }, [topic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleStart = () => {
    if (!topic.trim()) {
      setError('Please enter a topic name');
      return;
    }
    if (!content.trim() && mode === 'topic') {
      setError('Please enter some content or notes');
      return;
    }
    if (!content.trim() && mode === 'upload') {
      setError('Please upload a document first');
      return;
    }

    onStartQuiz({
      topic,
      content,
      difficulty,
      type,
      questionCount: count,
      timerSeconds: timerSeconds > 0 ? timerSeconds : undefined
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          &larr; Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setMode('upload')}
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === 'upload' ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Upload className="w-4 h-4" /> Upload Material
          </button>
          <button
            onClick={() => {
              setMode('topic');
              setFileName('');
              setContent('');
            }}
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === 'topic' ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Type className="w-4 h-4" /> Topic / Text Mode
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Physics, The French Revolution..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            {mode === 'upload' ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                  isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
                  fileName ? "bg-green-50 border-green-300" : ""
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  {isParsing ? (
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                  ) : fileName ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{fileName}</p>
                        <p className="text-sm text-green-600">Ready to generate</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setFileName(''); setContent(''); }}>
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PDF, DOCX, or TXT (Max 10MB)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Paste Content</label>
                 <textarea
                   value={content}
                   onChange={(e) => setContent(e.target.value)}
                   rows={6}
                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                   placeholder="Paste your notes, article, or raw text here..."
                 />
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> Difficulty
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                          difficulty === opt.value
                            ? `${opt.color} border-transparent ring-2 ring-offset-1 ring-primary-200`
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Timer className="w-4 h-4" /> Timer per Question
                   </label>
                   <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={120}
                        step={10}
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <span className="text-sm font-medium w-24 text-right">
                        {timerSeconds === 0 ? 'Off' : `${timerSeconds}s`}
                      </span>
                   </div>
                </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Question Type</label>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={cn(
                        "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                        type === opt.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Question Count</label>
                  <span className="text-sm font-medium text-primary-600">{count} Questions</span>
                </div>
                <input
                  type="range"
                  min={MIN_QUESTIONS}
                  max={MAX_QUESTIONS}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{MIN_QUESTIONS}</span>
                  <span>{MAX_QUESTIONS}</span>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <Button 
            onClick={handleStart} 
            isLoading={isLoading} 
            size="lg" 
            className="w-full shadow-lg shadow-primary-500/20"
          >
            Generate Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};
