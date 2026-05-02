import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, ChevronRight, CheckCircle, Star, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { Lesson } from '../types';

// Inline lesson data for offline use
const OFFLINE_LESSONS: Lesson[] = [
  { id: 'basics-1', module: 'Basics', title: 'What is Money?', order: 1, duration_min: 5, xp_reward: 50 },
  { id: 'basics-2', module: 'Basics', title: 'Budgeting 101', order: 2, duration_min: 8, xp_reward: 50 },
  { id: 'savings-1', module: 'Savings', title: 'Emergency Fund', order: 3, duration_min: 6, xp_reward: 50 },
  { id: 'investing-1', module: 'Investing', title: 'What is a SIP?', order: 4, duration_min: 7, xp_reward: 50 },
  { id: 'investing-2', module: 'Investing', title: 'Risk and Returns', order: 5, duration_min: 8, xp_reward: 50 },
  { id: 'loans-1', module: 'Loans', title: 'Understanding EMI', order: 6, duration_min: 6, xp_reward: 50 },
  { id: 'tax-1', module: 'Tax', title: 'Tax Saving Basics', order: 7, duration_min: 8, xp_reward: 50 },
];

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
      // Provide basic content offline
      setActiveLesson({
        ...lesson,
        content: `# ${lesson.title}\n\nThis lesson covers essential concepts about ${lesson.module.toLowerCase()}. Connect to the backend to access full lesson content with quizzes.`,
        quiz: [{ question: `What module is "${lesson.title}" part of?`, options: ['Basics', lesson.module, 'Advanced', 'Other'], correct: 1 }],
      });
    }
    setQuizAnswers({});
    setShowResults(false);
  };

  const submitQuiz = () => {
    setShowResults(true);
    if (activeLesson) {
      const correct = activeLesson.quiz?.filter((q, i) => quizAnswers[i] === q.correct).length || 0;
      const total = activeLesson.quiz?.length || 1;
      if (correct / total >= 0.5) {
        completeLesson(activeLesson.id);
        addXp(activeLesson.xp_reward);
        if (gamification.completed_lessons.length === 0) earnBadge('first_steps');
        if (gamification.completed_lessons.length + 1 >= 7) earnBadge('scholar');
      }
    }
  };

  const completedCount = gamification.completed_lessons.length;
  const progressPct = (completedCount / lessons.length) * 100;

  if (activeLesson) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
        <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
        </button>

        <div className="glass-light p-8 md:p-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest">{activeLesson.module}</span>
            <span className="text-sm text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-widest"><Clock size={14} /> {activeLesson.duration_min} min</span>
            <span className="text-sm text-amber-500 font-bold flex items-center gap-1.5 uppercase tracking-widest"><Star size={14} /> +{activeLesson.xp_reward} XP</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-10">{activeLesson.title}</h1>

          {/* Content */}
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-wrap mb-12">
            {activeLesson.content}
          </div>

          {/* Quiz */}
          {activeLesson.quiz && activeLesson.quiz.length > 0 && (
            <div className="pt-10 border-t border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Trophy size={24} className="text-amber-500" /> Module Checkpoint
              </h3>
              <div className="space-y-8">
                {activeLesson.quiz.map((q, qi) => (
                  <div key={qi} className="space-y-4">
                    <p className="text-lg font-bold text-slate-900">{qi + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[qi] === oi;
                        const isCorrect = showResults && oi === q.correct;
                        const isWrong = showResults && selected && oi !== q.correct;
                        return (
                          <button key={oi} onClick={() => !showResults && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer border-2 ${
                              isCorrect ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm' :
                              isWrong ? 'bg-rose-50 text-rose-700 border-rose-400 shadow-sm' :
                              selected ? 'bg-indigo-50 text-indigo-700 border-indigo-400 shadow-md ring-2 ring-indigo-50' :
                              'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
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
                  className="mt-12 w-full md:w-auto px-10 py-4 primary-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 disabled:opacity-40 cursor-pointer">
                  Submit Answers
                </motion.button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 p-8 rounded-3xl bg-slate-50 border border-slate-100">
                  {(() => {
                    const correct = activeLesson.quiz?.filter((q, i) => quizAnswers[i] === q.correct).length || 0;
                    const total = activeLesson.quiz?.length || 1;
                    const passed = correct / total >= 0.5;
                    return (
                      <div className="flex items-center justify-between gap-6">
                        <div className="space-y-1">
                          <p className={`text-xl font-extrabold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {passed ? '🎉 Lesson Accomplished!' : '📚 Keep Pushing!'}
                          </p>
                          <p className="text-slate-500 font-bold">You scored {correct} out of {total} correctly.</p>
                        </div>
                        {passed && <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-200 font-extrabold text-amber-500">+ {activeLesson.xp_reward} XP</div>}
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

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Learning Academy</h1>
        <p className="text-slate-500 text-lg font-medium">Level up your financial IQ with bite-sized lessons</p>
      </div>

      {/* Progress */}
      <div className="glass-light p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{completedCount} of {lessons.length} lessons completed</span>
          <span className="text-sm font-extrabold text-indigo-600">{progressPct.toFixed(0)}% Overall Progress</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full primary-gradient rounded-full"
            initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
        </div>
      </div>

      {/* Lessons */}
      <div className="grid grid-cols-1 gap-4">
        {lessons.map((lesson, i) => {
          const isCompleted = gamification.completed_lessons.includes(lesson.id);
          return (
            <motion.div key={lesson.id} onClick={() => openLesson(lesson)}
              className="w-full glass-light p-6 flex items-center gap-6 hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-200 transition-all text-left cursor-pointer group border-slate-100"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${
                isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {isCompleted ? <CheckCircle size={28} /> : <BookOpen size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">{lesson.module}</span>
                  {isCompleted && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> Mastery</span>}
                </div>
                <p className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{lesson.title}</p>
              </div>
              <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Clock size={16} className="text-slate-300"/> {lesson.duration_min}m</span>
                <span className="flex items-center gap-1.5 text-amber-500 uppercase tracking-tighter"><Star size={16} fill="currentColor"/> {lesson.xp_reward}</span>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
