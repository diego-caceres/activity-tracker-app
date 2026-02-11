'use client';

import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LocalDateRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('date')) return;

        const localToday = format(new Date(), 'yyyy-MM-dd');
        router.replace(`/?date=${localToday}`);
    }, [router, searchParams]);

    return (
        <div className="h-full flex items-center justify-center px-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Loading your local day...
        </div>
    );
}
