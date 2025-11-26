import { NextRequest, NextResponse } from 'next/server';
import { ParquetSchema, ParquetWriter } from '@dsnp/parquetjs';
import { getTodos, getHabitEvents, getDailyScore } from '@/lib/data';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    try {
        const [todos, habits, score] = await Promise.all([
            getTodos(date),
            getHabitEvents(date),
            getDailyScore(date),
        ]);

        const schema = new ParquetSchema({
            date: { type: 'UTF8' },
            todos: { type: 'UTF8' },
            habits: { type: 'UTF8' },
            score: { type: 'INT32' },
            timestamp: { type: 'INT64' },
        });

        const filename = `activity-tracker-${date}.parquet`;
        const filePath = path.join('/tmp', filename);

        const writer = await ParquetWriter.openFile(schema, filePath);

        await writer.appendRow({
            date,
            todos: JSON.stringify(todos),
            habits: JSON.stringify(habits),
            score,
            timestamp: Date.now(),
        });

        await writer.close();

        const fileBuffer = fs.readFileSync(filePath);

        // Clean up
        fs.unlinkSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename=${filename}`,
                'Content-Type': 'application/vnd.apache.parquet',
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
