import Image from 'next/image'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { TodoData } from '../../pages'

import closeIcon from '../../../public/close.svg'

import styles from './style.module.scss'

type OnSubmit = ((title: string, tasks: TodoData['tasks']) => void) | ((title: string, tasks: TodoData['tasks']) => Promise<void>)

interface TodoModalProps {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  onSubmit: OnSubmit
  todoData?: TodoData
}


export const TodoModal = ({ showModal, setShowModal, onSubmit, todoData }: TodoModalProps) => {
  const [ taskTitle, setTaskTitle ] = useState(todoData?.title ?? '')
  const [ tasks, setTasks ] = useState<TodoData['tasks']>(todoData?.tasks ?? [{ text:'', checked: false }])
  const taskListRef = useRef<HTMLUListElement>(null)
  const TodoModalRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const waitAddTaskEl = (index: number): Promise<HTMLLIElement | undefined> => {
    return new Promise(resolve => {
      const taskListItem = (taskListRef.current?.children[index] as HTMLLIElement)
      if(taskListItem) return resolve(taskListItem)

      const observer = new MutationObserver(mutations => {
        const taskListItem = (taskListRef.current?.children[index] as HTMLLIElement)
        if(taskListItem) resolve(taskListItem)
        observer.disconnect()
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }

  const addTask = async () => {
    setTasks(prev => {
      let newData = [...prev]
      newData.push({ text: '', checked: false })
      return newData
    })
    
    const taskListItem = await waitAddTaskEl(tasks.length)
    ;(taskListItem?.children[2] as HTMLInputElement).focus()
  }

  const removeTask = (index: number) => {
    setTasks(prev => {
      let newData = [...prev]
      newData.splice(index, 1)
      return newData
    })
  }

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if(event.key === 'Enter') {
      setTasks(prev => {
        let newData = [...prev]
        newData.splice(index + 1, 0, { text: '', checked: false })
        return newData
      })

      const taskListItem = await waitAddTaskEl(index + 1)

      ;(taskListItem?.children[2] as HTMLInputElement).focus()
    }

    if(event.key === 'Backspace' && event.target.value.length === 0) {
      event.preventDefault()
      removeTask(index)
      const position = index - 1 < 0 ? 0 : index - 1
    
      ;(taskListRef.current?.children[position].children[2] as HTMLInputElement).focus()
    }
  }

  const handleTaskChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, text: event.target.value } : t))
  }

  const showModalEl = () => {
    if(!TodoModalRef.current || !containerRef.current) return

    containerRef.current.style.display = 'block'
    TodoModalRef.current.style.bottom = '0px'
  }
  
  const closeModalEl = () => {
    if(!TodoModalRef.current || !containerRef.current) return

    TodoModalRef.current.style.bottom = '-400px'
    containerRef.current.style.display = 'none'
  }

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if(!containerRef.current) return

    if(event.target === containerRef.current) setShowModal(false)
  }

  const handleSubmit = async () => {
    await onSubmit(taskTitle, tasks)
    // if(todoData) setTasks(todoData.tasks)
    // else setTasks([])
  }

  useEffect(() => {
    if(showModal) showModalEl()
    else closeModalEl()
  }, [ showModal ])

  return (
    <div className={styles.container} onClick={handleContainerClick} ref={containerRef}>
      <div className={styles.task_modal} ref={TodoModalRef}>
        <input
          type="text" 
          placeholder='Title' 
          className={styles.title} 
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
        />
        <ul className={styles.tasks_list} ref={taskListRef}>
          {
            tasks.map((t, i) => {
              return (
                <li key={i}>
                  <button className={styles.remove_task_button} onClick={e => removeTask(i)}>
                    <Image src={closeIcon} alt='remove' />
                  </button>
                  <input type="checkbox" disabled />
                  <input
                    type="text" 
                    placeholder='New task'
                    value={t.text}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onChange={e => handleTaskChange(e, i)}
                  />
                </li>
              )
            })
          }
        </ul>
        <div className={styles.footer}>
          <button className={styles.addtask_button} onClick={addTask}>Add</button>
          <button className={styles.done_button} onClick={handleSubmit} >Done</button>
        </div>
      </div>
    </div>
  )
}