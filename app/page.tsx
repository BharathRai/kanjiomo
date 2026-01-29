"use client";

import Link from "next/link";
import { BookOpen, PenTool, Brain, Search, Trophy, Flame, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { getSRSItems } from "@/lib/srs";

export default function Home() {
    const [stats, setStats] = useState({ total: 0, learned: 0, mastered: 0, due: 0 });

    useEffect(() => {
        // Calculate stats from local storage
        if (typeof window !== 'undefined') {
            const items = getSRSItems();
            const all = Object.values(items);
            const now = Date.now();

            setStats({
                total: all.length,
                learned: all.filter(i => i.status !== 'new').length,
                mastered: all.filter(i => i.status === 'mastered').length,
                due: all.filter(i => i.nextReviewDate <= now).length
            });
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-6 lg:p-24 bg-slate-50">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-slate-200 bg-white/80 pb-4 pt-4 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-white lg:p-4 shadow-sm">
                    Ultimate Kanji Memory Engine
                </p>

                {/* Stats Pill */}
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <div className="flex gap-6 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl mb-4 lg:mb-0">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-bold uppercase">Mastered</span>
                            <span className="text-xl font-bold text-emerald-400">{stats.mastered}</span>
                        </div>
                        <div className="w-px bg-slate-700"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 font-bold uppercase">Due</span>
                            <span className="text-xl font-bold text-blue-400">{stats.due}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Level Selector */}
            <div className="z-20 fixed top-6 right-6 lg:absolute lg:top-8 lg:right-24 flex gap-2">
                {['ALL', 'N5', 'N4'].map(lvl => (
                    <button
                        key={lvl}
                        onClick={() => {
                            localStorage.setItem('kanji_level', lvl);
                            window.location.reload();
                        }}
                        className="px-3 py-1 rounded-full text-xs font-bold border border-slate-200 bg-white/80 backdrop-blur text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                    >
                        {lvl}
                    </button>
                ))}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    // Highlight active
                    const cur = localStorage.getItem('kanji_level') || 'ALL';
                    // (Simple script just for init, React refresh handles click)
                 `}} />
            </div>

            <div className="relative flex place-items-center mb-16">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                        Master Kanji. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Only Once.</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        A cognitive science approach to Japanese literacy. Use stroke visualization, semantic logic, and spaced repetition to never forget.
                    </p>
                </div>
            </div>

            <div className="grid text-left lg:max-w-6xl lg:w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href="/quiz" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-24 h-24" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold flex items-center gap-2 text-slate-800">
                        Start Quiz <ArrowRightIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                    </h2>
                    <p className="text-slate-500">
                        Active recall session. You have <strong className="text-blue-600">{stats.due} items</strong> due for review right now.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600">
                        <span>Start Session</span>
                    </div>
                </Link>

                <Link href="/logic" className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain className="w-24 h-24" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-slate-800">
                        Deconstruct
                    </h2>
                    <p className="text-slate-500">
                        Understand the "why" behind the character. Break down complex Kanji into simple radicals.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-purple-600">
                        <span>Explore Logic</span>
                    </div>
                </Link>

                {/* Placeholder for future detailed stats or settings */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1 opacity-70">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-24 h-24" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-slate-800">
                        Progress
                    </h2>
                    <p className="text-slate-500">
                        View your long-term retention curves and mastery heatmap.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <span>Coming Soon</span>
                    </div>
                </div>

            </div>
        </main>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    )
}
