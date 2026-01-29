"use client";

import React, { useState, useEffect } from 'react';
import KanjiDeconstruct from '@/components/KanjiDeconstruct';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dummy data including parts (this would ideally come from the JSON/API)
const KANJI_DB = [
    {
        character: "明",
        parts: [{ part: "日", meaning: "Sun" }, { part: "月", meaning: "Moon" }],
        meaning: "Bright",
        story: "Top bring the sun and moon together is to create brightness."
    },
    {
        character: "休",
        parts: [{ part: "亻", meaning: "Person" }, { part: "木", meaning: "Tree" }],
        meaning: "Rest",
        story: "A person leaning against a tree is resting."
    },
    {
        character: "男",
        parts: [{ part: "田", meaning: "Rice Field" }, { part: "力", meaning: "Power" }],
        meaning: "Man",
        story: "Using power in the rice field is the role of a man."
    }
];

export default function DeconstructPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [selectedKanji, setSelectedKanji] = useState<any>(null);

    useEffect(() => {
        fetch('/n5_kanji_data.json')
            .then(res => res.json())
            .then(json => {
                // FEATURE: Filter by Level
                const prefLevel = localStorage.getItem('kanji_level') || 'ALL';
                let filtered = json;
                if (prefLevel !== 'ALL') {
                    filtered = json.filter((k: any) => k.level === prefLevel || !k.level);
                }

                setData(filtered);
                if (filtered.length > 0) setSelectedKanji(filtered[0]);
            });
    }, []);

    // Filter
    const filtered = data.filter(k => k.character.includes(searchTerm) || (k.meaning && k.meaning.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!selectedKanji) return <div className="p-10 text-center">Loading Dictionary...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="max-w-4xl mx-auto flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Semantic Deconstruction</h1>
            </header>

            <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar / List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-fit">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Kanji..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {filtered.map(k => (
                            <button
                                key={k.character}
                                onClick={() => setSelectedKanji(k)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedKanji.character === k.character ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                            >
                                <span className="text-xl font-serif">{k.character}</span>
                                <span className="text-sm text-slate-500">{k.meaning}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Visualizer */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">Visual Equation</h2>
                        {selectedKanji.parts && selectedKanji.parts.length > 0 ? (
                            <KanjiDeconstruct
                                character={selectedKanji.character}
                                parts={selectedKanji.parts}
                                meaning={selectedKanji.meaning}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                <span className="text-4xl opacity-20 mb-2">{selectedKanji.character}</span>
                                <p className="text-slate-500 font-medium">Deconstruction Data Unavailable</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
                                    Radical breakdown is not present in the source PDF.
                                    (Updates coming via jamdict integration).
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Memory Story</h3>
                        <p className="text-slate-600 leading-relaxed italic mb-6">
                            "{selectedKanji.story || 'Story not available for this custom entry.'}"
                        </p>

                        {/* Example Sentences */}
                        {selectedKanji.examples && selectedKanji.examples.length > 0 && (
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Context Usage</h4>
                                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                                    {selectedKanji.examples.map((ex: any, idx: number) => (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            <p className="mb-1"><span className="font-bold text-slate-800">{ex.japanese}</span></p>
                                            {ex.english && <p className="text-xs text-slate-500">{ex.english}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
