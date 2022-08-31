import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { http } from '../utils/http'
import axios from 'axios'
import { NodeCard } from '../components/NoteCard'
import { NoteData, NoteLocked } from './notes/[noteId]'

import searchIcon from '../../public/search.svg'
import addIcon from '../../public/add.svg'
import readerIcon from '../../public/reader.svg'
import checkboxIcon from '../../public/checkbox.svg'

import styles from '../styles/Home.module.scss'
import { useRef, useState } from 'react'
import { TodoModal } from '../components/TodoModal'
import { TodoCard } from '../components/TodoCard'

export interface TodoData {
  id: number,
  title: string,
  tasks: {
    text: string,
    checked: boolean
  }[],
  created_at: string
}

export interface HomeProps {
  notes: (NoteData | NoteLocked)[],
  todos: TodoData[]
}

export const lowerCase = (string: string) => string.toLocaleLowerCase()

const Home: NextPage<HomeProps> = ({ notes: notesProp, todos: todosProp }) => {
  const router = useRouter()
  const [ searchQuery, setSearchQuery ] = useState('')
  const [ notes, setNotes ] = useState(notesProp) 
  const [ todos, setTodos ] = useState(todosProp)
  const filteredNotes =
  	notes.filter(n => lowerCase(n.title).includes(searchQuery) || lowerCase(n.content).includes(searchQuery))
  const filteredTodos =
   todos.filter(
    todo => lowerCase(todo.title).includes(searchQuery)
     || todo.tasks.filter(t => lowerCase(t.text).includes(searchQuery)).length > 0
    )  
  const navBarListRef = useRef<HTMLUListElement>(null)
  const [ tab, setTab ] = useState('notesTab')
  const [ showModal, setShowModal ] = useState(false)

  const create = async () => {
    switch (tab) {
      case 'notesTab':
        try {
          const { data } = await http.post('/notes', {
            content: ''
          })
          
          router.push(`/notes/${data.id}`)
        } catch (error: any) {
          console.log(error)
        }
        break
      case 'todosTab':
        setShowModal(true)
        break
      default:
        break
    }
  }

  const changeTab = async (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    navBarListRef.current?.childNodes.forEach(c => {
      (c as HTMLLIElement).classList.remove(styles.active)
    })
    event.currentTarget.classList.add(styles.active)

    setTab(event.currentTarget.id)
    if(event.currentTarget.id === 'todosTab') await refreshTodosData()
  }

  const onTodoModalSubmit = async (title: string, tasks: TodoData['tasks']) => {
    try {
      await http.post('todos', { title, tasks })
      await refreshTodosData()
      setShowModal(false)
    } catch (error: any) {
      console.log(error)
    }
  }

  const refreshTodosData = async () => {
    try {
      const { data: todosData } = await http.get('/todos')
      
      setTodos((todosData as TodoData[]).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)))
    } catch (error: any) {
      console.log(error)
    }
  }
  
  return (
    <div className={styles.home_page}>
      <div className={styles.search_box}>
        <div className={styles.image_box} >
          <Image src={searchIcon} alt='search' />
        </div>
        <input
         type="text" 
         placeholder='Look for notes' 
         onChange={e => setSearchQuery(lowerCase(e.target.value))}
        />
      </div>

      <nav className={styles.nav_bar}>
        <ul className={styles.nav_list} ref={navBarListRef} >
          <li className={`${styles.nav_item} ${styles.active}`} onClick={changeTab} id='notesTab'>
            <Image src={readerIcon} alt='reader icon' />
          </li>
          <li className={styles.nav_item} onClick={changeTab} id='todosTab'>
            <Image src={checkboxIcon} alt='checkbox icon'/>
          </li>
        </ul>
      </nav>

      {
        tab === 'notesTab' ? (
          <div className={styles.notes_container}>
            {
              filteredNotes.map((note, index) => {
                if(note.important) return <NodeCard note={note} key={index} searchQuery={searchQuery} />
              })
            }
            {
              filteredNotes.map((note, index) => {
                if(!note.important) return <NodeCard note={note} key={index} searchQuery={searchQuery} />
              })
            }
            
          </div>
        ) 
        : tab === 'todosTab' ? (
          <div className={styles.tasks_container}>
            {
              filteredTodos.map((todo, index) => {
                return <TodoCard todo={todo} key={index} searchQuery={searchQuery} refreshTodosData={refreshTodosData}/>
              })
            }
            <TodoModal
             showModal={showModal}
             setShowModal={setShowModal}
             onSubmit={onTodoModalSubmit}
            />
          </div>
        ) 
        : (<></>)
      }

      <button className={styles.add_button} onClick={create}>
        <div className={styles.image_box}>
          <Image src={addIcon} alt='add' />
        </div>
      </button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  let notes: NoteData[]
  let todos: TodoData[]

  try {
    const notesResponse = await axios.get('http://server:5000/notes')
    const todosResponse = await axios.get('http://server:5000/todos')
    
    notes = (notesResponse.data as NoteData[]).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    todos = (todosResponse.data as TodoData[]).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  } catch (error: any) {
    notes = []
    todos = []
    console.log(error.message)
  }

  return {
    props: {
      notes,
      todos
    }
  }
}

export default Home
