import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, RefreshCw, FileDown, CheckCircle, XCircle, Sparkles, Brain, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import { Button } from './ui/Button';
import { QuizQuestion, UserAnswer } from '../types';
import { generateStudyGuide } from '../services/geminiService';

interface ResultsViewProps {
  topic: string;
  questions: QuizQuestion[];
  answers: UserAnswer[];
  onBackToDashboard: () => void;
  isReviewMode?: boolean; 
}

export const ResultsView: React.FC<ResultsViewProps> = ({ topic, questions, answers, onBackToDashboard, isReviewMode }) => {
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  const [loadingStudyGuide, setLoadingStudyGuide] = useState(false);

  const score = useMemo(() => {
    const correct = answers.filter(a => a.isCorrect).length;
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions.length]);

  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = questions.length - correctCount;

  const chartData = [
    { name: 'Correct', value: correctCount, color: '#22c55e' },
    { name: 'Incorrect', value: incorrectCount, color: '#ef4444' },
  ];

  useEffect(() => {
    if (score >= 70 && !isReviewMode) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b']
      });
    }
  }, [score, isReviewMode]);

  useEffect(() => {
    if (incorrectCount > 0 && !isReviewMode && !studyGuide) {
      fetchStudyGuide();
    }
  }, []); 

  const fetchStudyGuide = async () => {
    setLoadingStudyGuide(true);
    try {
      const incorrectAnswers = answers.filter(a => !a.isCorrect);
      const guide = await generateStudyGuide(topic, incorrectAnswers);
      setStudyGuide(guide);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudyGuide(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("QuizMaster Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Topic: ${topic}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Score: ${score}% (${correctCount}/${questions.length})`, 14, 42);

    const tableData = questions.map((q, i) => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      const isCorrect = userAnswer?.isCorrect ? 'Correct' : 'Incorrect';
      return [
        `Q${i + 1}`,
        q.question,
        userAnswer?.selectedOption || '-',
        q.correctAnswer,
        isCorrect
      ];
    });

    autoTable(doc, {
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Status']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20 },
      },
      headStyles: { fillColor: [14, 165, 233] }
    });

    if (studyGuide) {
       doc.addPage();
       doc.setFontSize(16);
       doc.text("AI Study Guide", 14, 20);
       doc.setFontSize(10);
       const cleanText = studyGuide.replace(/[*_#`]/g, '');
       const splitText = doc.splitTextToSize(cleanText, 180);
       doc.text(splitText, 14, 30);
    }

    doc.save("quiz-results.pdf");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Results</h1>
        <Button variant="secondary" onClick={onBackToDashboard} className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700">Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-dark rounded-3xl p-6 text-center shadow-lg dark:shadow-none">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Performance</h2>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-5xl font-display font-extrabold ${score >= 50 ? 'text-slate-800 dark:text-white' : 'text-red-500'}`}>
                   {score}%
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-2">Final Score</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
               <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                 <div className="w-3 h-3 rounded-full bg-green-500"></div> Correct ({correctCount})
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div> Incorrect ({incorrectCount})
               </div>
            </div>
          </div>

          <div className="space-y-3">
             <Button onClick={downloadPDF} variant="outline" className="w-full justify-start dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
               <FileDown className="w-4 h-4 mr-2" /> Download Report PDF
             </Button>
             {!isReviewMode && (
                <Button onClick={onBackToDashboard} variant="primary" className="w-full justify-center">
                  <RefreshCw className="w-4 h-4 mr-2" /> Start New Quiz
                </Button>
             )}
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* AI Study Guide Section */}
           {incorrectCount > 0 && (
             <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/30 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-white dark:bg-indigo-500/20 p-2 rounded-xl shadow-sm dark:shadow-none">
                      <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                   </div>
                   <h3 className="text-xl font-bold text-indigo-900 dark:text-white">AI Study Guide</h3>
                   {loadingStudyGuide && <span className="text-xs text-indigo-500 dark:text-indigo-300 animate-pulse ml-2">Generating personalized tips...</span>}
                </div>
                
                <div className="relative z-10">
                   {loadingStudyGuide ? (
                     <div className="space-y-4">
                       <div className="h-4 bg-indigo-200 dark:bg-indigo-500/20 rounded w-3/4 animate-pulse"></div>
                       <div className="h-4 bg-indigo-200 dark:bg-indigo-500/20 rounded w-full animate-pulse"></div>
                       <div className="h-4 bg-indigo-200 dark:bg-indigo-500/20 rounded w-5/6 animate-pulse"></div>
                     </div>
                   ) : studyGuide ? (
                     <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-900 dark:text-indigo-100" {...props} />,
                            h2: ({node, ...props}) => <h4 className="text-base font-bold mt-3 mb-2 text-indigo-800 dark:text-indigo-200" {...props} />,
                            h3: ({node, ...props}) => <h5 className="text-base font-bold mt-3 mb-2 text-indigo-800 dark:text-indigo-200" {...props} />,
                            strong: ({node, ...props}) => <span className="font-semibold text-indigo-700 dark:text-indigo-300" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-outside space-y-1 ml-4 mb-4 text-slate-700 dark:text-slate-300" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />,
                          }}
                        >
                          {studyGuide}
                        </ReactMarkdown>
                     </div>
                   ) : (
                     <Button size="sm" variant="secondary" onClick={fetchStudyGuide} className="bg-white dark:bg-white/10 text-indigo-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-white/20 border-indigo-100 dark:border-white/10">
                        <Sparkles className="w-4 h-4 mr-2 text-indigo-500 dark:text-yellow-300" /> Generate Tips for Improvement
                     </Button>
                   )}
                </div>
             </div>
           )}

           <div className="space-y-4">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Detailed Review
             </h3>
             {questions.map((q, index) => {
               const userAnswer = answers.find(a => a.questionId === q.id);
               const isCorrect = userAnswer?.isCorrect;

               return (
                 <div key={q.id} className="glass-dark rounded-2xl p-6 transition-all hover:shadow-md dark:hover:bg-slate-800/80">
                   <div className="flex items-start gap-4">
                     <span className={`
                       flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                       ${isCorrect ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'}
                     `}>
                       {index + 1}
                     </span>
                     <div className="flex-1">
                       <p className="font-medium text-slate-900 dark:text-slate-100 text-lg mb-4">{q.question}</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'}`}>
                           <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Your Answer</p>
                           <p className={`font-medium ${isCorrect ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                             {userAnswer?.selectedOption || 'Skipped'}
                           </p>
                           {!isCorrect && <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-2" />}
                         </div>
                         
                         {!isCorrect && (
                           <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
                             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Correct Answer</p>
                             <p className="font-medium text-blue-800 dark:text-blue-300">{q.correctAnswer}</p>
                             <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-2" />
                           </div>
                         )}
                       </div>

                       <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                         <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1">Explanation: </span>
                         {q.explanation}
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};