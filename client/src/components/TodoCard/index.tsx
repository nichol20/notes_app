import Image from 'next/image'
import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { TodoData } from '../../pages'
import { http } from '../../utils/http'
import { HighlightedText } from '../HighlightedText'
import { TodoModal } from '../TodoModal'

import trashIcon from '../../../public/trash.svg'

import styles from './style.module.scss'
import { SelectionModeBox } from '../SelectionModeBox'

interface TodoCardProps {
  todo: TodoData
  searchQuery: string
  refreshTodosData: () => Promise<void>
  selectedCardIds: number[]
  setSelectedCardIds: Dispatch<SetStateAction<number[]>>
}

export const TodoCard = ({ todo, searchQuery, refreshTodosData, selectedCardIds, setSelectedCardIds }: TodoCardProps) => {
  const [ showModal, setShowModal ] = useState(false)
  const [ title, setTitle ] = useState('')
  const [ tasks, setTasks ] = useState<TodoData['tasks']>([])
  const [ timeoutId, setTimeoutId ] = useState<NodeJS.Timeout>()
  const TodoCardRef = useRef<HTMLDivElement>(null)

  const onTodoModalSubmit = async (title: string, tasks: TodoData['tasks']) => {
    try {
      await http.patch(`/todos/${todo.id}`, { title, tasks })
      setTitle(title)
      setTasks(tasks)
      setShowModal(false)
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleOnMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const timeout = setTimeout(() => {
      setSelectedCardIds(prev => {
        const newData = [...prev]
        newData.push(todo.id)
        return newData
      })
    }, 1000)
    setTimeoutId(timeout)
  }

  const handleOnMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    clearTimeout(timeoutId)
    if(selectedCardIds.length === 0 && event.target === TodoCardRef.current) {
      setShowModal(true)
    }
  }

  const toggleCheck = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newTasks = tasks.map((t, i) => i === index ? { ...t, checked: event.target.checked } : t)
    try {
      await http.patch(`/todos/${todo.id}`, {
        tasks: newTasks
      })

      setTasks(newTasks)
    } catch (error: any) {
      console.log(error)
    }
  }

  const toggleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedCardIds(prev => {
      if(prev.filter(id => id === todo.id).length === 0 && event.target.checked) {
        const newData = [...prev]
        newData.push(todo.id)
        return newData
      } else {
        return prev.filter(id => id !== todo.id)
      }
    })
  }

  const deleteTask = async () => {
    try {
      await http.delete(`/todos/${todo.id}`)
      await refreshTodosData()
    } catch (error: any) {
      console.log(error)
    }
  }

  useEffect(() => {
    setTitle(todo.title)
    setTasks(todo.tasks)
  }, [ todo ])

  return (
    <>
      <div className={styles.task_card} onMouseDown={handleOnMouseDown} onMouseUp={handleOnMouseUp} ref={TodoCardRef} >
      {
        selectedCardIds.length > 0 && (
          <SelectionModeBox
           checked={selectedCardIds.filter(id => id === todo.id).length > 0}
           onChange={toggleSelection}
          />
        )
      }
        <h3 className={styles.title}><HighlightedText text={title} snippet={searchQuery} /></h3>
        <ul className={styles.tasks_list}>
          {
            tasks.map((t, i) => {
              return (
                <li key={i}>
                  <label className={styles.checkbox_container}>
                    <input type="checkbox" checked={t.checked} onChange={e => toggleCheck(e, i)} />
                    <span className={styles.checkmark}></span>
                  </label>
                  <span><HighlightedText text={t.text} snippet={searchQuery}/></span>
                </li>
              )
            })
          }
        </ul>

        {
          selectedCardIds.length === 0 && (
            <button className={styles.delete_task_button} onClick={deleteTask} >
              <Image src={trashIcon} alt="trash icon" />
            </button>
          )
        }
      </div>
      {
        showModal && <TodoModal
          setShowModal={setShowModal}
          onSubmit={onTodoModalSubmit}
          todoData={{...todo, tasks, title }}
        />
      }
    </>
  )
}