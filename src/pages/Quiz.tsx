import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    if (selectedOption !== null) return;

    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      showToast('Correct Answer', 'Good choice! Review the explanation below.', 'success');
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
        color: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
      };
    } else if (pct >= 60) {
      return {
        title: "Cyber Sentinel",
        desc: "Great job! You have solid baseline habits. Keep practicing core configurations.",
        color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
      };
    } else {
      return {
        title: "Cyber Novice",
        desc: "Learning opportunity! Review general guidelines to shield your identity online.",
        color: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
      };
    }
  };

  const progressPercentage = ((currentIndex) / quizQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-6 text-left">
      <AnimatePresence mode="wait">
        {/* INTRO SCREEN */}
        {quizState === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs"
          >
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto text-primary">
              <Award className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Cyber Hygiene Quiz
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                Evaluate your security habits across realistic email, messaging, password, and public connectivity threat scenarios.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left py-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>5 Real scenarios</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>Instant explanations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>Sentinel rank badge</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                <span>100% Client-side</span>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 mx-auto"
            >
              Start Quiz <Play className="h-4 w-4 fill-current" />
            </button>
          </motion.div>
        )}

        {/* PLAYING & EXPLANATION SCREENS */}
        {(quizState === 'playing' || quizState === 'explanation') && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Scenario {currentIndex + 1} of {quizQuestions.length}</span>
                <span>Correct: {correctAnswersCount}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Scenario Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" /> Threat Scenario
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {currentQuestion.scenario}
              </div>
            </div>

            {/* Options selection */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                const isIncorrectSelection = isSelected && !isCorrectAnswer;

                let btnStyles = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900';

                if (selectedOption !== null) {
                  if (isCorrectAnswer) {
                    btnStyles = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                  } else if (isIncorrectSelection) {
                    btnStyles = 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                  } else {
                    btnStyles = 'border-slate-200 dark:border-slate-800 opacity-50 text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={selectedOption !== null}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold flex justify-between items-center transition-all shadow-xs ${btnStyles}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && (
                      <span className="shrink-0 pl-3">
                        {isCorrectAnswer && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        {isIncorrectSelection && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Security Lesson</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                >
                  <span>{currentIndex + 1 < quizQuestions.length ? 'Next Scenario' : 'View Results'}</span>
                  <ChevronRight className="h-4 w-4" />
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
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs"
          >
            <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto text-primary">
              <Award className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Quiz Completed</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Your performance score:
              </p>
              <p className="text-5xl font-extrabold text-primary pt-1">
                {correctAnswersCount} / {quizQuestions.length}
              </p>
            </div>

            {/* Rank badge container */}
            <div className={`p-5 rounded-2xl border max-w-md mx-auto text-center space-y-1.5 ${getRankBadge(correctAnswersCount, quizQuestions.length).color}`}>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Awarded Rank: {getRankBadge(correctAnswersCount, quizQuestions.length).title}
              </h4>
              <p className="text-xs leading-relaxed">
                {getRankBadge(correctAnswersCount, quizQuestions.length).desc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Try Again
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Dashboard Reports</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
