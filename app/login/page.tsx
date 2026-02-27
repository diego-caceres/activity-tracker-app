'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/';

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.replace(from);
            } else {
                const data = await res.json();
                setError(data.error || 'Something went wrong.');
                setPassword('');
            }
        } catch {
            setError('Could not reach the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 px-8">
            <div className="w-full space-y-8">
                {/* Icon + title */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
                        <Lock className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Daily Tracker</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your password to continue</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            autoFocus
                            autoComplete="current-password"
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-[#1b1f2e] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-rose-500 dark:text-rose-400 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                    >
                        {loading ? 'Verifying...' : 'Unlock'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
