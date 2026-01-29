export type SRSItem = {
    character: string;
    interval: number; // in days
    repetition: number;
    efactor: number;
    nextReviewDate: number; // timestamp
    status: 'new' | 'learning' | 'review' | 'mastered';
};

export type ExampleSentence = {
    japanese: string;
    romaji: string;
    english: string;
};

export type KanjiData = {
    character: string;
    onyomi: string[];
    kunyomi: string[];
    meaning: string;
    stroke_count: number;
    level?: string; // "N5", "N4" etc.
    lesson?: string; // "1 課", "Lesson 3" etc.
    pdf_id?: string; // Original index in PDF
    examples: ExampleSentence[];
    parts?: string[]; // Radical parts for deconstruction
    story?: string; // Mnemonic story
};

const STORAGE_KEY = 'kanji_srs_data';

export const getSRSItems = (): Record<string, SRSItem> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

export const saveSRSItems = (items: Record<string, SRSItem>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const initializeSRS = (kanjiList: any[]) => {
    const current = getSRSItems();
    const newItems = { ...current };
    let changed = false;

    kanjiList.forEach((k) => {
        if (!newItems[k.character]) {
            newItems[k.character] = {
                character: k.character,
                interval: 0,
                repetition: 0,
                efactor: 2.5,
                nextReviewDate: Date.now(),
                status: 'new',
            };
            changed = true;
        }
    });

    if (changed) saveSRSItems(newItems);
    return newItems;
};

export const processReview = (item: SRSItem, quality: number): SRSItem => {
    let { interval, repetition, efactor } = item;

    if (quality < 3) {
        repetition = 0;
        interval = 1;
    } else {
        // SuperMemo-2 Algorithm
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * efactor);
        }
        repetition += 1;
    }

    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (efactor < 1.3) efactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        ...item,
        interval,
        repetition,
        efactor,
        nextReviewDate: nextDate.getTime(),
        status: quality === 5 && interval > 21 ? 'mastered' : 'review'
    };
};

export const getReviewQueue = (items: Record<string, SRSItem>) => {
    const now = Date.now();
    return Object.values(items)
        .filter(item => item.nextReviewDate <= now || item.status === 'new')
        .sort((a, b) => {
            // prioritize new cards if due dates are close
            if (a.status === 'new' && b.status !== 'new') return -1;
            if (a.status !== 'new' && b.status === 'new') return 1;
            return a.nextReviewDate - b.nextReviewDate;
        });
};

// Continuous Learning Mode: Fetch new items OR future review items
export const getContinuousQueue = (items: Record<string, SRSItem>) => {
    // 1. Get Due Items (Normal SRS)
    const due = getReviewQueue(items);
    if (due.length > 0) return due;

    // 2. If no due, get 'new' items that haven't been seen
    const newItems = Object.values(items).filter(i => i.status === 'new');
    if (newItems.length > 0) return newItems;

    // 3. If no new items, get future reviews (Cram Mode)
    // Sort by closest due date first
    const future = Object.values(items)
        .filter(i => i.status !== 'new')
        .sort((a, b) => a.nextReviewDate - b.nextReviewDate);

    return future;
};
