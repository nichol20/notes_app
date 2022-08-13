import express from 'express'
import db from '../db'

export interface NoteDataFromDB {
  id: number
	title: string
  password: string
	content: string
	created_at: Date
	important: boolean
	reminder: string | null
}

const notesRoutes = express.Router()

notesRoutes.get('/notes', async (req, res) => {
  const query = {
    text: 'SELECT * FROM notes',
    params: []
  }

  try {
    const response = await db.query(query)

    const data = response.rows.map((note: NoteDataFromDB) => {
      if(note.password?.length > 0) {
        return {
          id: note.id,
          title: 'locked',
          content: 'locked',
          created_at: note.created_at,
          important: note.important,
          reminder: null,
          needAPassword: true
        }
      }
      else {
        delete note.password
        return note
      }
    })

    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(400).json(error.message)
  }
})

notesRoutes.get('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params
  const { authorization } = req.headers
  const query = {
    text: 'SELECT * FROM notes WHERE id = $1',
    params: [ noteId ]
  }

  try {
    const response = await db.query(query)

    if(response.rows.length === 0) return res.status(404).json({ message: 'Note not found!' })

    const noteData: NoteDataFromDB = response.rows[0]

    if(
      noteData?.password
      && noteData.password !== authorization
    ) {
      return res.status(203).json({
        id: noteData.id,
        title: 'locked',
        content: 'locked',
        created_at: noteData.created_at,
        important: noteData.important,
        reminder: null,
        needAPassword: true
      })
    } 

    delete noteData.password

    return res.status(200).json(noteData)
  } catch (error: any) {
    return res.status(400).json(error.message)
  }
})

notesRoutes.post('/notes', async (req, res) => {
  const {
    title,
    content,
    important,
    password,
    reminder
  } = req.body

  const query = {
    text: `
      INSERT INTO notes (title, content, created_at, important, password, reminder) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, content, created_at, important, reminder;
    `,
    params: [
      title ?? '',
      content ?? '',
      new Date(),
      important ? important : false,
      password ?? '',
      reminder ?? null
    ]
  }

  try {
    const response = await db.query(query)

    return res.status(201).json(response.rows[0])
  } catch (error: any) {
    return res.status(400).json(error.message)
  }
})

notesRoutes.patch('/notes/:noteId', async (req, res) => {
  const {
    title,
    content,
    important,
    password,
    reminder
  } = req.body

  const { noteId } = req.params

  const get_query = {
    text: `SELECT * FROM notes WHERE id=$1`,
    params: [noteId]
  }
  

  try {
    const { rows } = await db.query(get_query)
    const previousData = rows[0]

    const update_query = {
      text: `
        UPDATE notes 
        SET 
          title=$1,
          content=$2,
          important=$3,
          password=$4,
          reminder=$5
        WHERE id=$6
        RETURNING *
      `,
      params: [
        typeof(title) === 'string' ? title : previousData.title,
        typeof(content) === 'string' ? content : previousData.content,
        typeof(important) === 'boolean' ? important : previousData.important,
        typeof(password) === 'string' ? password : previousData.password,
        reminder ? reminder : previousData.reminder,
        noteId
      ]
    }

    const response = await db.query(update_query)

    return res.status(200).json(response.rows[0])
  } catch (error: any) {
    console.log(error.message)
    return res.status(400).json(error.message)
  }
})

notesRoutes.delete('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params

  const query = {
    text: `
      DELETE FROM notes
      WHERE id = $1
    `,
    params: [noteId]
  }

  try {
    await db.query(query)

    return res.status(200).json({ message: 'successfully deleted' })
  } catch (error: any) {
    return res.status(400).json(error.message)
  }
})

export {
  notesRoutes
}