import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'

import db from './db'
import { notesRoutes } from './routes/notes'

const PORT = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())
app.use(notesRoutes)


// Global error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack)
  res.status(500).send('Something broke!')
})

db.init(err => {
  if(err) {
    console.log(err)
    process.exit()
  }
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
})