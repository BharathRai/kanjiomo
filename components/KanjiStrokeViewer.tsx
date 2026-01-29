"use client";

import React, { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { Play, RotateCcw, Pause } from "lucide-react";

interface KanjiStrokeViewerProps {
    character: string;
    size?: number;
}

export default function KanjiStrokeViewer({ character, size = 200 }: KanjiStrokeViewerProps) {
    const writerRef = useRef<HanziWriter | null>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (targetRef.current && !writerRef.current) {
            writerRef.current = HanziWriter.create(targetRef.current, character, {
                width: size,
                height: size,
                padding: 5,
                showOutline: true,
                strokeAnimationSpeed: 1,
                delayBetweenStrokes: 200,
                radicalColor: "#3b82f6", // brand-primary
            });
        }

        // Update if character changes
        if (writerRef.current && character) {
            writerRef.current.setCharacter(character);
        }
    }, [character, size]);

    const animate = () => {
        if (writerRef.current) {
            setIsPlaying(true);
            writerRef.current.animateCharacter({
                onComplete: () => setIsPlaying(false),
            });
        }
    };

    const loop = () => {
        if (writerRef.current) {
            setIsPlaying(true);
            writerRef.current.loopCharacterAnimation();
        }
    };

    const pause = () => {
        // HanziWriter generic pause not always exposed easily, but cancelAnimation stops it.
        if (writerRef.current) {
            writerRef.current.cancelAnimation();
            setIsPlaying(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div
                ref={targetRef}
                className="bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={animate}
            />

            <div className="flex gap-2">
                <button
                    onClick={animate}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Play size={16} /> Play
                </button>
                <button
                    onClick={pause}
                    disabled={!isPlaying}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 rounded-md text-sm font-medium hover:bg-slate-200 disabled:opacity-50 transition-all"
                >
                    <Pause size={16} /> Stop
                </button>
            </div>
        </div>
    );
}
