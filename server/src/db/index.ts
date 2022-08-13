import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

interface Query {
  text: string
  params: any[]
}

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  port: 5432,
  database: 'notes_app',
  password: 'postgres123'
})

export default {
  query: async (query: Query) => {
    const start = Date.now()
    const response = await pool.query(query.text, query.params)
    const duration = Date.now() - start

    console.log('executed query', {text: query.text, duration, rows: response.rowCount })

    return response
  },

  init: async (callback: (err?: any) => void) => {
    try {
      const creationQueries = fs.readdirSync(path.resolve('src/db/migrations/sql'))
      creationQueries.forEach(async file => {
        const query = await readFile(path.resolve('src/db/migrations/sql', file), 'utf-8')
        await pool.query(query)
      })
      callback()
    } catch (error) {
      callback(error)
    }
  }
}