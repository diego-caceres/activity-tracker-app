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
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    Daily Notes
                </span>
                {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            </button>

            {!isExpanded && (
                <p
                    className="mt-2 text-xs text-gray-500 dark:text-gray-400"
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
                        className="w-full p-4 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-900"
                    />
                    {isSavingNote && (
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            Saving...
                        </div>
                    )}
                </div>
            )}
            {noteContent.trim().length > 0 && !isSavingNote && (
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    Saved on blur
                </p>
            )}
        </div>
    );
}
