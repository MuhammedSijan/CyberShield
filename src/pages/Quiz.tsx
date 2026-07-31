import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ArrowRight, CheckCircle2, XCircle, RefreshCw, 
  HelpCircle, ShieldCheck, ChevronRight, Play 
} from 'lucide-react';
import { quizQuestions } from '../data/quizQuestions';
import { useToast } from '../hooks/useToast';
import { useSecurity } from '../context/SecurityContext';

type QuizState = 'intro' | 'playing' | 'explanation' | 'finished';

export const Quiz: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const { showToast } = useToast();
  const { addScan } = useSecurity();

  const currentQuestion = quizQuestions[currentIndex];

  const handleStartQuiz = () => {
    setQuizState('playing');
    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectAnswersCount(0);
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (selectedOption !== null) return; // Prevent double clicking
    
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      showToast('Correct Answer', 'Good choice! Review explanation below.', 'success');
    } else {
      showToast('Incorrect Answer', 'Incorrect. Check details below to learn why.', 'danger');
    }

    setQuizState('explanation');
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuizState('playing');
    } else {
      setQuizState('finished');
      
      const scorePct = (correctAnswersCount / quizQuestions.length) * 100;
      const riskScore = 100 - scorePct;
      const riskLevel = scorePct === 100 ? 'Safe' : scorePct >= 60 ? 'Suspicious' : 'Danger';
      
      addScan('quiz', 'Cyber Hygiene Quiz', `Score: ${correctAnswersCount}/${quizQuestions.length}`, riskScore, riskLevel);
      showToast('Quiz Finished', `You scored ${correctAnswersCount}/${quizQuestions.length}!`, 'success');
    }
  };

  const getRankBadge = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct === 100) {
      return {
        title: "Cyber Guardian",
        desc: "Outstanding! You scored a perfect index. Your online habits are highly secure.",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      };
    } else if (pct >= 60) {
      return {
        title: "Cyber Sentinel",
        desc: "Great job! You have solid baseline habits. Keep practicing core configurations.",
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
      };
    } else {
      return {
        title: "Cyber Novice",
        desc: "Learning opportunity! Review general guidelines to shield your identity online.",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
      };
    }
  };

  const progressPercentage = ((currentIndex) / quizQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <AnimatePresence mode="wait">
        {/* INTRO SCREEN */}
        {quizState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-8 rounded-3xl text-center space-y-6 border-slate-200 dark:border-slate-800 py-16"
          >
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
              <Award className="h-12 w-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Cyber Hygiene Quiz</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
                Evaluate your security habits across common email, social, password, and public connectivity threat scenarios.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left py-4">
              <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-400">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>5 Real-world scenarios</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-400">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>Instant explanations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-400">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>Get a security rank badge</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-400">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>100% Privacy Focused</span>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
            >
              Start Quiz <Play className="h-4 w-4 fill-current" />
            </button>
          </motion.div>
        )}

        {/* PLAYING & EXPLANATION SCREENS */}
        {(quizState === 'playing' || quizState === 'explanation') && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-455">
                <span>Scenario {currentIndex + 1} of {quizQuestions.length}</span>
                <span>Correct: {correctAnswersCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Scenario Card */}
            <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-550 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-primary" /> Active Scenario
              </span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                {currentQuestion.scenario}
              </p>
            </div>

            {/* Options selection */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                const isIncorrectSelection = isSelected && !isCorrectAnswer;

                let btnStyles = 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/35 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300';
                
                if (selectedOption !== null) {
                  if (isCorrectAnswer) {
                    btnStyles = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450';
                  } else if (isIncorrectSelection) {
                    btnStyles = 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-450';
                  } else {
                    btnStyles = 'border-slate-200 dark:border-slate-800 opacity-50 text-slate-400 dark:text-slate-600 cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={selectedOption !== null}
                    className={`p-4 rounded-xl border glass-panel text-left text-sm font-semibold flex justify-between items-center transition-all ${btnStyles}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && (
                      <span className="shrink-0 pl-3">
                        {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {isIncorrectSelection && <XCircle className="h-5 w-5 text-rose-500" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {quizState === 'explanation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800 space-y-4 bg-gradient-to-br from-primary/5 to-slate-900/5"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Security Lesson</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5 ml-auto"
                >
                  {currentIndex + 1 < quizQuestions.length ? 'Next Scenario' : 'View Results'} <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* FINISHED SCREEN */}
        {quizState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-8 rounded-3xl text-center space-y-6 border-slate-200 dark:border-slate-800 py-16"
          >
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
              <Award className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Hygiene Quiz Completed</h2>
              <p className="text-slate-455 dark:text-slate-500 text-xs">
                Your total score:
              </p>
              <p className="text-5xl font-black text-primary text-glow">
                {correctAnswersCount} / {quizQuestions.length}
              </p>
            </div>

            {/* Rank badge container */}
            <div className={`p-5 rounded-2xl border max-w-md mx-auto text-center space-y-2 ${getRankBadge(correctAnswersCount, quizQuestions.length).color}`}>
              <h4 className="font-black text-sm uppercase tracking-wider">
                Awarded Badge: {getRankBadge(correctAnswersCount, quizQuestions.length).title}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {getRankBadge(correctAnswersCount, quizQuestions.length).desc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try Again
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                Return to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
