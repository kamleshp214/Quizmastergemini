import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    if (!inputKey.startsWith('AIza')) {
      setError('That doesn\'t look like a valid Gemini API key (starts with AIza)');
      // We allow it anyway in case format changes, but warning is good UX
    }
    onSave(inputKey);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white text-center">
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Welcome to QuizMaster</h2>
              <p className="text-primary-100 text-sm">Enter your Gemini API Key to continue</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setError('');
                    }}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  />
                  {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your API key is stored locally in your browser's LocalStorage. It is never sent to our servers, only directly to Google's API.
                  </p>
                </div>

                <Button type="submit" className="w-full py-3 group">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="text-center mt-4">
                   <a 
                     href="https://aistudio.google.com/app/apikey" 
                     target="_blank" 
                     rel="noreferrer"
                     className="text-xs text-gray-500 hover:text-primary-600 underline"
                   >
                     Don't have a key? Get one here
                   </a>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
