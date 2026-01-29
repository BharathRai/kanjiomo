"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { getSRSItems, initializeSRS, processReview, getReviewQueue, getContinuousQueue, saveSRSItems, SRSItem, KanjiData } from '@/lib/srs';
import KanjiStrokeViewer from '@/components/KanjiStrokeViewer';
import { Check, X, ArrowRight, BookOpen, RefreshCw, Trophy } from 'lucide-react';
import Link from 'next/link';

type QuizPhase = 'guess' | 'reveal';

export default function QuizPage() {
    const [queue, setQueue] = useState<SRSItem[]>([]);
    const [currentItem, setCurrentItem] = useState<SRSItem | null>(null);
    const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
    const [fullData, setFullData] = useState<KanjiData[]>([]);

    // Quiz State
    const [quizPhase, setQuizPhase] = useState<QuizPhase>('guess');
    const [options, setOptions] = useState<KanjiData[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Filters State
    const [lessons, setLessons] = useState<string[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<string>('ALL');
    const [currentLevel, setCurrentLevel] = useState<string>('ALL');
    const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    // Initial Load
    useEffect(() => {
        const load = async () => {
            const prefLevel = localStorage.getItem('kanji_level') || 'ALL';
            setCurrentLevel(prefLevel);

            try {
                const res = await fetch('/n5_kanji_data.json');
                const data: KanjiData[] = await res.json();

                // Calculate Counts for UI
                const counts: Record<string, number> = { ALL: data.length };
                data.forEach(k => {
                    const l = k.level || 'Unknown';
                    counts[l] = (counts[l] || 0) + 1;
                });
                setLevelCounts(counts);

                // 1. Filter by Level
                let levelFiltered = data;
                if (prefLevel !== 'ALL') {
                    levelFiltered = data.filter(k => k.level === prefLevel || !k.level);
                }

                // 2. Extract Lessons & Sort Naturally
                const uniqueLessons = Array.from(new Set(levelFiltered.map(k => k.lesson || 'Unknown').filter(l => l !== 'Unknown')));
                uniqueLessons.sort((a, b) => {
                    // Extract first number found
                    const numA = parseInt(a.match(/\d+/)?.pop() || '0');
                    const numB = parseInt(b.match(/\d+/)?.pop() || '0');
                    return numA - numB;
                });
                setLessons(uniqueLessons);

                setFullData(levelFiltered);

                // 3. Initialize Queue
                initQueue(levelFiltered, 'ALL');

            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleLevelChange = (lvl: string) => {
        localStorage.setItem('kanji_level', lvl);
        window.location.reload();
    };

    const initQueue = (data: KanjiData[], lessonFilter: string) => {
        let activeData = data;
        if (lessonFilter !== 'ALL') {
            // Exact match for lesson string e.g. "Lesson 1"
            activeData = data.filter(k => k.lesson === lessonFilter);
        }

        const items = initializeSRS(activeData);
        const q = getContinuousQueue(items);
        setQueue(q);

        if (q.length > 0) {
            setFinished(false);
            processNewCard(q[0], data);
        } else {
            setFinished(true);
        }
    };

    const processNewCard = (item: SRSItem, sourceData: KanjiData[]) => {
        setCurrentItem(item);
        const kData = sourceData.find(k => k.character === item.character);
        setKanjiData(kData || null);

        setQuizPhase('guess');
        setSelectedOption(null);
        setIsCorrect(null);

        if (kData) {
            const others = sourceData.filter(k => k.character !== item.character);
            const shuffled = [...others].sort(() => 0.5 - Math.random());
            const distractors = shuffled.slice(0, 3);
            const opts = [...distractors, kData].sort(() => 0.5 - Math.random());
            setOptions(opts);
        }
    };

    const handleLessonChange = (newLesson: string) => {
        setSelectedLesson(newLesson);
        initQueue(fullData, newLesson);
    };

    const handleGuess = (guessedChar: string) => {
        if (!currentItem || selectedOption) return;

        setSelectedOption(guessedChar);
        const correct = guessedChar === currentItem.character;
        setIsCorrect(correct);

        setTimeout(() => {
            setQuizPhase('reveal');
        }, 1000);
    };

    const handleRate = (quality: number) => {
        if (!currentItem || !queue.length) return;

        const updatedItem = processReview(currentItem, quality);

        const allItems = getSRSItems();
        allItems[updatedItem.character] = updatedItem;
        saveSRSItems(allItems);

        const nextQueue = queue.slice(1);
        setQueue(nextQueue);

        if (nextQueue.length > 0) {
            processNewCard(nextQueue[0], fullData);
        } else {
            setFinished(true);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Game Engine...</div>;

    if (finished) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Lesson Complete!</h1>
                <p className="text-slate-500 mb-8">You've reached the end of the current queue for {selectedLesson === 'ALL' ? 'all lessons' : selectedLesson}.</p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" /> Checks for New
                    </button>
                    <Link href="/" className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">

            {/* Header / Stats / Filter */}
            <div className="w-full max-w-3xl flex flex-wrap justify-between items-center mb-8 gap-4 px-4 sticky top-0 py-4 bg-slate-50/80 backdrop-blur z-20 hover:bg-slate-50 transition-colors">
                <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </Link>

                <div className="flex gap-3 overflow-x-auto pb-1 items-center">
                    {/* Level Selector with Counts */}
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shrink-0">
                        {['ALL', 'N5', 'N4'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => handleLevelChange(lvl)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${currentLevel === lvl ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {lvl} <span className="opacity-60 ml-1 text-[10px]">({levelCounts[lvl] || 0})</span>
                            </button>
                        ))}
                    </div>

                    {/* Lesson Selector */}
                    <div className="relative shrink-0">
                        <select
                            value={selectedLesson}
                            onChange={(e) => handleLessonChange(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                        >
                            <option value="ALL">All Lessons</option>
                            {lessons.map(l => (
                                <option key={l} value={l}>{l.replace(/(\d+)/, ' $1 ')}</option> // Add spacing around numbers?
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <BookOpen className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                <div className="text-xs font-mono text-slate-400 whitespace-nowrap">
                    Due: <span className="text-slate-700 font-bold">{queue.length}</span>
                </div>
            </div>

            {/* Game Card */}
            <div className="w-full max-w-md perspective-1000">
                <div className={`relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-500 ${quizPhase === 'reveal' ? 'ring-4 ring-blue-50' : ''}`}>

                    {/* Progress Line */}
                    <div className="h-1 w-full bg-slate-100">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, (queue[0]?.repetition || 0) * 20)}%` }}></div>
                    </div>

                    {/* PHASE 1: QUESTION (Always visible top part) */}
                    <div className="flex flex-col items-center p-10 pb-6">
                        {/* Optional ID display if available */}
                        {kanjiData?.pdf_id && (
                            <div className="absolute top-4 left-4 text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-md font-mono">
                                #{kanjiData.pdf_id}
                            </div>
                        )}

                        <div className="mb-8 relative group min-h-[160px] flex items-center justify-center">
                            {/* Show Stroke on Reveal, or always? User wants Guessing Game. */}
                            {quizPhase === 'reveal' ? (
                                <KanjiStrokeViewer
                                    character={currentItem!.character}
                                    size={140}
                                />
                            ) : (
                                <span className="text-[9rem] leading-none font-serif text-slate-800">
                                    {currentItem!.character}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* PHASE 1: OPTIONS (Guessing) */}
                    {quizPhase === 'guess' && (
                        <div className="p-6 pt-0 grid grid-cols-1 gap-3 pb-8">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleGuess(opt.character)}
                                    className={`
                                        p-4 rounded-xl text-left font-medium transition-all text-slate-600 border border-slate-200
                                        hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md
                                        ${selectedOption === opt.character ? 'bg-blue-100 border-blue-400' : 'bg-white'}
                                        group relative overflow-hidden
                                    `}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <span className="opacity-40 font-mono text-xs w-4 flex justify-center bg-slate-100 rounded h-5 items-center group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                                                {['A', 'B', 'C', 'D'][idx]}
                                            </span>
                                            <span className="text-lg font-bold">{opt.meaning.split(',')[0]}</span>
                                        </div>
                                        {/* FEATURE: Hiragana Reading */}
                                        <span className="text-xs text-slate-400 group-hover:text-blue-600 font-jp bg-slate-50 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors">
                                            {opt.kunyomi[0] || opt.onyomi[0] || ''}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PHASE 2: FEEDBACK & REVEAL */}
                    {quizPhase === 'reveal' && kanjiData && (
                        <div className="p-8 pt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Result Banner */}
                            <div className={`text-center mb-6 py-2 rounded-lg font-bold text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {isCorrect ? 'Correct! 🎉' : 'Study this one!'}
                            </div>

                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-blue-600 mb-1">{kanjiData.meaning}</h2>
                                <div className="flex justify-center gap-6 text-sm mt-3">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 tracking-wider mb-1">ONYOMI</span>
                                        <span className="text-slate-700 font-jp">{kanjiData.onyomi.join(' / ') || '-'}</span>
                                    </div>
                                    <div className="w-px bg-slate-200"></div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 tracking-wider mb-1">KUNYOMI</span>
                                        <span className="text-slate-700 font-jp">{kanjiData.kunyomi.join(' / ') || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Examples */}
                            {kanjiData.examples && kanjiData.examples.length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Usage</h4>
                                    <div className="text-sm space-y-3">
                                        <div className="border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                            <div className="font-bold text-slate-700 font-jp">{kanjiData.examples[0].japanese}</div>
                                            <div className="text-slate-500 text-xs">{kanjiData.examples[0].english}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rating Actions */}
                            <div className="grid grid-cols-4 gap-2">
                                <RatingBtn label="Again" sub="1m" color="bg-rose-100 text-rose-700 hover:bg-rose-200" onClick={() => handleRate(1)} />
                                <RatingBtn label="Hard" sub="1d" color="bg-orange-100 text-orange-700 hover:bg-orange-200" onClick={() => handleRate(3)} />
                                <RatingBtn label="Good" sub="3d" color="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => handleRate(4)} />
                                <RatingBtn label="Easy" sub="7d" color="bg-emerald-100 text-emerald-700 hover:bg-emerald-200" onClick={() => handleRate(5)} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

const RatingBtn = ({ label, sub, color, onClick }: any) => (
    <button onClick={onClick} className={`${color} py-3 rounded-lg flex flex-col items-center transition-transform hover:scale-105 active:scale-95 shadow-sm`}>
        <span className="font-bold text-sm">{label}</span>
        <span className="text-[10px] opacity-75">{sub}</span>
    </button>
);
