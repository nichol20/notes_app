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
import trashIcon from '../../public/trash.svg'
import closeIcon from '../../public/close.svg'
import checkmarkIcon from '../../public/checkmark.svg'

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
  const [ showTodoModal, setShowTodoModal ] = useState(false)
  const [ selectedCardIds, setSelectedCardIds ] = useState<number[]>([])

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
        setShowTodoModal(true)
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
      setShowTodoModal(false)
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

  const refreshNotesData = async () => {
    try {
      const { data: notesData } = await http.get('/notes')

      setNotes(notesData)
    } catch (error: any) {
      console.log(error)
    }
  }
  
  const closeSelectionMode = () => {
    setSelectedCardIds([])
  }

  const selectAll = () => {
    setSelectedCardIds(notes.map(note => note.id))
  }

  const deleteSelected = async () => {
    try {
      switch(tab) {
        case 'notesTab':
          await Promise.all(selectedCardIds.map(async id => {
            await http.delete(`/notes/${id}`)
          }))
          refreshNotesData()
          break

        case 'todosTab':
          await Promise.all(selectedCardIds.map(async id => {
              await http.delete(`/todos/${id}`)
          }))
          refreshTodosData()
          break

        default:
          break
      }
      
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <div className={styles.home_page}>
      <header className={styles.home_header}>
        {
          selectedCardIds.length > 0 ? (
            <div className={styles.selection_mode_options_header}>
              <button className={styles.close_selection_mode_button} onClick={closeSelectionMode}>
                <Image src={closeIcon} alt='close icon' />
              </button>
              <span className={styles.selected_items_quantity}>{selectedCardIds.length} selected items</span>
              <button className={styles.select_all_button} onClick={selectAll}>
                <Image src={checkmarkIcon} alt='checkmark icon' />
              </button>
            </div>
          ) : (
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
          )
        }
      </header>

      <div className={styles.search_box}>
        <div className={styles.image_box} >
          <Image src={searchIcon} alt='search' />
        </div>
        <input
         type="text" 
         placeholder='Search' 
         onChange={e => setSearchQuery(lowerCase(e.target.value))}
        />
      </div>

      {
        tab === 'notesTab' ? (
          <div className={styles.notes_container}>
            {
              filteredNotes.map((note, index) => {
                if(note.important) return <NodeCard
                 note={note} 
                 key={index} 
                 searchQuery={searchQuery} 
                 selectedCardIds={selectedCardIds}
                 setSelectedCardIds={setSelectedCardIds} 
                />
              })
            }
            {
              filteredNotes.map((note, index) => {
                if(!note.important) return <NodeCard
                 note={note} 
                 key={index} 
                 searchQuery={searchQuery} 
                 selectedCardIds={selectedCardIds}
                 setSelectedCardIds={setSelectedCardIds}
                />
              })
            }
            
          </div>
        ) 
        : tab === 'todosTab' ? (
          <div className={styles.tasks_container}>
            {
              filteredTodos.map((todo, index) => {
                return <TodoCard
                 todo={todo} 
                 key={index} 
                 searchQuery={searchQuery} 
                 refreshTodosData={refreshTodosData}
                 selectedCardIds={selectedCardIds}
                 setSelectedCardIds={setSelectedCardIds}
                />
              })
            }

            {
              showTodoModal && <TodoModal
               setShowModal={setShowTodoModal}
               onSubmit={onTodoModalSubmit}
              /> 
            }
          </div>
        ) 
        : (<></>)
      }

      {
        selectedCardIds.length === 0 && (
          <button className={styles.add_button} onClick={create}>
            <div className={styles.image_box}>
              <Image src={addIcon} alt='add' />
            </div>
          </button>
        )
      }

      {
        selectedCardIds.length > 0 && (
          <div className={styles.selection_mode_options_footer}>
            <ul>
              <li>
                <button className={styles.delete_all_button} onClick={deleteSelected}>
                  <Image src={trashIcon} alt='trash icon' />
                </button>
              </li>
            </ul>
          </div>
        )
      }
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
