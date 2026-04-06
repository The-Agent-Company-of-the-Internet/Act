import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let db: ReturnType<typeof drizzle>

export function getDb() {
  if (!db) {
    const config = useRuntimeConfig()
    const pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: true,
    })
    db = drizzle(pool, { schema })
  }
  return db
}