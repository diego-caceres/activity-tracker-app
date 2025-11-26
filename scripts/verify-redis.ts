import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function verifyConnection() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
        console.error('❌ Missing environment variables: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
        process.exit(1)
    }

    console.log('Checking connection to:', url)

    try {
        const redis = new Redis({
            url,
            token,
        })

        await redis.set('test-connection', 'success')
        const value = await redis.get('test-connection')

        if (value === 'success') {
            console.log('✅ Connection successful! Read/Write verified.')
            await redis.del('test-connection')
        } else {
            console.error('❌ Connection failed: Value mismatch.')
            process.exit(1)
        }
    } catch (error) {
        console.error('❌ Connection failed:', error)
        process.exit(1)
    }
}

verifyConnection()
