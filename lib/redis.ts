import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL || 'https://example.upstash.io';
const token = process.env.UPSTASH_REDIS_REST_TOKEN || 'example_token';

export const redis = new Redis({
    url,
    token,
});

if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn('UPSTASH_REDIS_REST_URL is not defined. Redis calls will fail.');
}
