import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, ChevronRight, CheckCircle, Star, ArrowLeft, PlayCircle, Award } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { Lesson } from '../types';

const OFFLINE_LESSONS: Lesson[] = [
  { id: 'basics-1', module: 'Basics', title: 'What is Money?', order: 1, duration_min: 5, xp_reward: 50 },
  { id: 'basics-2', module: 'Basics', title: 'Budgeting 101', order: 2, duration_min: 8, xp_reward: 50 },
  { id: 'savings-1', module: 'Savings', title: 'Emergency Fund', order: 3, duration_min: 6, xp_reward: 50 },
  { id: 'investing-1', module: 'Investing', title: 'What is a SIP?', order: 4, duration_min: 7, xp_reward: 50 },
  { id: 'investing-2', module: 'Investing', title: 'Risk and Returns', order: 5, duration_min: 8, xp_reward: 50 },
  { id: 'loans-1', module: 'Loans', title: 'Understanding EMI', order: 6, duration_min: 6, xp_reward: 50 },
  { id: 'tax-1', module: 'Tax', title: 'Tax Saving Basics', order: 7, duration_min: 8, xp_reward: 50 },
];

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

function ProgressRing({ value, size = 60, strokeWidth = 5, color = '#6c63ff' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <span className="absolute text-[11px] font-extrabold tracking-tight" style={{ color }}>{Math.round(value)}%</span>
    </div>
  );
}

export default function Learn() {
  const { gamification, completeLesson, addXp, earnBadge } = useStore();
  const [lessons, setLessons] = useState<Lesson[]>(OFFLINE_LESSONS);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    api.getLessons().then((d) => setLessons(d.lessons)).catch(() => {});
  }, []);

  const openLesson = async (lesson: Lesson) => {
    try {
      const full = await api.getLesson(lesson.id);
      setActiveLesson(full);
    } catch {
      setActiveLesson({
        ...lesson,
        content: `# ${lesson.title}\n\nThis lesson covers essential concepts about ${lesson.module.toLowerCase()}. Connect to the backend to access full lesson content with interactive quizzes. Understanding these principles is the first step toward financial freedom.`,
        quiz: [{ question: `What module is "${lesson.title}" part of?`, options: ['Basics', lesson.module, 'Advanced', 'Other'], correct: 1 }],
      });
    }
    setQuizAnswers({});
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitQuiz = () => {
    setShowResults(true);
    if (activeLesson) {
      const correct = activeLesson.quiz?.filter((q, i) => quizAnswers[i] === q.correct).length || 0;
      const total = activeLesson.quiz?.length || 1;
      if (correct / total >= 0.5) {
        if (!gamification.completed_lessons.includes(activeLesson.id)) {
          completeLesson(activeLesson.id);
          addXp(activeLesson.xp_reward);
          if (gamification.completed_lessons.length === 0) earnBadge('first_steps');
          if (gamification.completed_lessons.length + 1 >= lessons.length) earnBadge('scholar');
        }
      }
    }
  };

  const completedCount = gamification.completed_lessons.length;
  const progressPct = (completedCount / lessons.length) * 100;

  /* ── Lesson View ── */
  if (activeLesson) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto pb-12">
        <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-surface-400 hover:text-finity-600 font-extrabold transition-colors cursor-pointer group w-max">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
        </button>

        <div className="glass-card p-6 md:p-12 border-t-4 border-t-finity-500">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 rounded-lg bg-finity-50 text-finity-600 text-[10px] font-extrabold uppercase tracking-widest border border-finity-100">{activeLesson.module}</span>
            <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> {activeLesson.duration_min} min read</span>
            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md"><Star size={12} /> +{activeLesson.xp_reward} XP</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-surface-900 tracking-tight mb-8 leading-tight">{activeLesson.title}</h1>

          {/* Markdown Content Simulation */}
          <div className="prose prose-slate max-w-none prose-p:text-surface-600 prose-p:font-medium prose-p:leading-relaxed prose-p:text-lg prose-headings:font-extrabold prose-headings:text-surface-900 prose-headings:tracking-tight mb-16">
            {activeLesson.content}
          </div>

          {/* Knowledge Check */}
          {activeLesson.quiz && activeLesson.quiz.length > 0 && (
            <div className="pt-10 border-t-2 border-dashed border-surface-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Trophy size={20} /></div>
                <div>
                  <h3 className="text-xl font-extrabold text-surface-900 tracking-tight">Knowledge Check</h3>
                  <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">Verify your understanding</p>
                </div>
              </div>

              <div className="space-y-8">
                {activeLesson.quiz.map((q, qi) => (
                  <div key={qi} className="space-y-4">
                    <p className="text-base font-extrabold text-surface-900">{qi + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = showResults && oi === q.correct;
                        const isWrong = showResults && selected && oi !== q.correct;
                        return (
                          <button key={oi} onClick={() => !showResults && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
                              isCorrect ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm ring-2 ring-emerald-50' :
                              isWrong ? 'bg-rose-50 text-rose-700 border-rose-400 shadow-sm' :
                              selected ? 'bg-finity-50 text-finity-700 border-finity-400 shadow-sm ring-2 ring-finity-50' :
                              'bg-white text-surface-600 border-surface-100 hover:border-surface-200 hover:bg-surface-50'
                            }`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {!showResults ? (
                <motion.button onClick={submitQuiz} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={Object.keys(quizAnswers).length < (activeLesson.quiz?.length || 0)}
                  className="mt-10 w-full md:w-auto px-10 py-3.5 btn-primary text-sm rounded-xl disabled:opacity-40 cursor-pointer">
                  Submit Answers
                </motion.button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-6 rounded-2xl border-2 bg-white">
                  {(() => {
                    const correct = activeLesson.quiz?.filter((q, i) => quizAnswers[i] === q.correct).length || 0;
                    const total = activeLesson.quiz?.length || 1;
                    const passed = correct / total >= 0.5;
                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${passed ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                            {passed ? <Award size={28} /> : <BookOpen size={28} />}
                          </div>
                          <div>
                            <p className={`text-xl font-extrabold tracking-tight ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {passed ? 'Lesson Accomplished!' : 'Keep Practicing!'}
                            </p>
                            <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mt-0.5">Scored {correct} of {total} correctly</p>
                          </div>
                        </div>
                        {passed && (
                          <div className="px-5 py-2.5 bg-amber-50 rounded-xl border border-amber-100 font-extrabold text-amber-500 flex items-center gap-2">
                            <Star size={16} /> +{activeLesson.xp_reward} XP
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── Curriculum View ── */
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="ai-orb-sm"><BookOpen size={14} className="text-white" /></div>
            <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">Financial Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
            Learning <span className="gradient-text">Academy</span>
          </h1>
        </div>
        
        {/* Overall Progress */}
        <div className="glass-card p-4 flex items-center gap-5 w-full md:w-auto">
          <ProgressRing value={progressPct} size={48} strokeWidth={4} color="#10b981" />
          <div>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Curriculum Mastery</p>
            <p className="text-lg font-extrabold text-surface-900 tracking-tight">{completedCount} of {lessons.length} Modules</p>
          </div>
        </div>
      </motion.div>

      {/* Course List */}
      <div className="space-y-3">
        {lessons.map((lesson, i) => {
          const isCompleted = gamification.completed_lessons.includes(lesson.id);
          return (
            <motion.div key={lesson.id} onClick={() => openLesson(lesson)}
              {...fadeUp(0.1 + i * 0.05)}
              className={`glass-card p-4 sm:p-5 flex items-center gap-4 sm:gap-6 group cursor-pointer transition-all hover:border-finity-300 hover:shadow-lg hover:shadow-finity-500/10 ${isCompleted ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-surface-50 text-surface-400 group-hover:bg-finity-50 group-hover:text-finity-600'}`}>
                {isCompleted ? <CheckCircle size={24} /> : <PlayCircle size={24} className="ml-0.5" />}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{lesson.module}</span>
                  {isCompleted && <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={8}/> Done</span>}
                </div>
                <p className="text-base sm:text-lg font-extrabold text-surface-900 tracking-tight group-hover:text-finity-600 transition-colors truncate">{lesson.title}</p>
              </div>
              
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-5 text-[11px] font-bold text-surface-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock size={14}/> {lesson.duration_min}m</span>
                <span className="flex items-center gap-1.5 text-amber-500"><Star size={14}/> {lesson.xp_reward}</span>
              </div>
              
              {/* Arrow */}
              <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-surface-400 group-hover:bg-finity-600 group-hover:text-white transition-colors shrink-0">
                <ChevronRight size={16} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
