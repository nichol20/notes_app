import express from 'express'
import db from '../db'

const todosRoutes = express.Router()

todosRoutes.get('/todos', async (req, res) => {
  const query = {
    text: `SELECT * FROM todos`,
    params: []
  }

  try {
    const response = await db.query(query)

    return res.status(200).json(response.rows)
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
})

todosRoutes.post('/todos', async (req, res) => {
  const { tasks, title } = req.body
  
  if(!tasks || !Array.isArray(tasks) || (title && typeof(title) !== 'string'))
   return res.status(400).json({ message: 'Bad request'})
  
  tasks.forEach(task => {
    if(
      typeof(task.text) !== 'string'
      || typeof(task.checked) !== 'boolean'
    ) return res.status(400).json({ message: 'Bad request' })
  })

  const query = {
    text: `
      INSERT INTO todos (tasks, title, created_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    params: [ 
      tasks,
      title ?? '',
      new Date() 
    ]
  }

  try {
    const response = await db.query(query)

    console.log(response.rows)
    return res.status(200).json(response.rows[0])
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
})

todosRoutes.get('/todos/:todoId', async (req, res) => {
  const { todoId } = req.params

  const query = {
    text: `
      SELECT * FROM todos
      WHERE id = $1
      RETURNING *
    `,
    params: [ todoId ]
  }

  try {
    const response = await db.query(query)

    if(response.rows.length === 0) return res.status(404).json({ message: 'To-do not found' })

    return res.status(200).json(response.rows[0])
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
})

todosRoutes.patch('/todos/:todoId', async (req, res) => {
  const { tasks, title } = req.body
  const { todoId } = req.params

  if((tasks && !Array.isArray(tasks)) || (title && typeof(title) !== 'string'))
   return res.status(400).json({ message: 'Bad request'})
  
  tasks?.forEach(task => {
    if(
      !('text' in task)
      || !('checked' in task)
      || typeof(task.text) !== 'string'
      || typeof(task.checked) !== 'boolean'
    ) return res.status(400).json({ message: 'Bad request' })
  })

  const get_query = {
    text: `SELECT * FROM todos WHERE id=$1`,
    params: [todoId]
  }

  try {
    const { rows } = await db.query(get_query)
    const previousData = rows[0]

    const update_query = {
      text: `
        UPDATE todos
        SET
         tasks = $1,
         title = $2
        WHERE id = $3
        RETURNING *
      `,
      params: [ 
        tasks ?? previousData.tasks, 
        typeof(title) === 'string' ? title : previousData.title, 
        todoId 
      ]
    }

    const response = await db.query(update_query)

    return res.status(200).json(response.rows[0])
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
})

todosRoutes.delete('/todos/:todoId', async (req, res) => {
  const { todoId } = req.params

  const query = {
    text: `
      DELETE FROM todos
      WHERE id = $1
    `,
    params: [ todoId ]
  }

  try {
    await db.query(query)

    return res.status(200).json({ message: 'successfully deleted' })
  } catch (error: any) {
    return res.status(400).json(error.message)
  }
})

export {
  todosRoutes
}