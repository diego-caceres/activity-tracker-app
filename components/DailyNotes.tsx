'use client';

import { useState } from 'react';
import { DailyNote } from '@/types';
import { saveNote } from '@/app/actions';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface DailyNotesProps {
    date: string;
    note: DailyNote | null;
}

export default function DailyNotes({ date, note }: DailyNotesProps) {
    const [noteContent, setNoteContent] = useState(note?.content || '');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        await saveNote(date, noteContent);
        setIsSavingNote(false);
    };

    const preview = noteContent.trim().length > 0
        ? noteContent.trim().slice(0, 75)
        : 'Tap to add a quick note';

    return (
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#141720]">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    Daily Notes
                </span>
                {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
            </button>

            {!isExpanded && (
                <p
                    className="mt-2 text-xs text-slate-500 dark:text-slate-400"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {preview}
                </p>
            )}

            {isExpanded && (
                <div className="relative mt-3">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onBlur={handleSaveNote}
                        placeholder="Write your thoughts, reflections, or notes for the day..."
                        className="w-full p-4 border border-slate-200 dark:border-white/[0.07] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-y shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-[#1b1f2e]"
                    />
                    {isSavingNote && (
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                            Saving...
                        </div>
                    )}
                </div>
            )}
            {noteContent.trim().length > 0 && !isSavingNote && (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Saved on blur
                </p>
            )}
        </div>
    );
}
