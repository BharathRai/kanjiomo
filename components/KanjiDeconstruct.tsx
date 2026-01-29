import React from 'react';
import { Plus, MoveRight } from 'lucide-react';

interface KanjiDeconstructProps {
    character: string;
    parts: string[] | { part: string; meaning: string }[];
    meaning: string;
}

export default function KanjiDeconstruct({ character, parts, meaning }: KanjiDeconstructProps) {
    // Helper to normalize parts
    const normalizedParts = parts.map(p => {
        if (typeof p === 'string') return { part: p, meaning: '?' };
        return p;
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 px-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">

            {normalizedParts.map((p, idx) => (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-serif text-slate-700 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                            {p.part}
                        </span>
                        {/* Only show meaning if it's not a generic placeholder */}
                        {p.meaning !== '?' && (
                            <span className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider">{p.meaning}</span>
                        )}
                    </div>
                    {idx < normalizedParts.length - 1 && <Plus className="text-slate-400 w-6 h-6" />}
                </React.Fragment>
            ))}

            <MoveRight className="text-slate-400 w-6 h-6 rotate-90 md:rotate-0" />

            <div className="flex flex-col items-center">
                <span className="text-6xl font-serif text-blue-600 bg-white p-6 rounded-xl shadow-md border border-blue-100">
                    {character}
                </span>
                <span className="text-sm text-blue-600 mt-2 font-bold uppercase tracking-wider">{meaning}</span>
            </div>

        </div>
    );
}
