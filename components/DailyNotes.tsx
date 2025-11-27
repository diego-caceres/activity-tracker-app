'use client';

import { useState, useEffect } from 'react';
import { DailyNote } from '@/types';
import { saveNote } from '@/app/actions';
import { FileText } from 'lucide-react';

interface DailyNotesProps {
    date: string;
    note: DailyNote | null;
}

export default function DailyNotes({ date, note }: DailyNotesProps) {
    const [noteContent, setNoteContent] = useState(note?.content || '');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Update note content when date changes
    useEffect(() => {
        setNoteContent(note?.content || '');
    }, [date, note]);

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        await saveNote(date, noteContent);
        setIsSavingNote(false);
    };

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                Daily Notes
            </h2>
            <div className="relative">
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
        </div>
    );
}
