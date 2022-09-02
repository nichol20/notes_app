import { GetServerSideProps, NextPage } from "next"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from "react"
import DatePicker from 'react-datepicker'
import axios from 'axios'

import { http } from "../../utils/http"

import arrowBackIcon from '../../../public/arrow-back.svg'
import padlockIcon from '../../../public/padlock.svg'
import checkmarkIcon from '../../../public/checkmark.svg'
import trashIcon from '../../../public/trash.svg'
import clockIcon from '../../../public/alarm-outline.svg'
import alertCircleIcon from '../../../public/alert-circle.svg'

import styles from '../../styles/NotePage.module.scss'
import { PasswordInput } from "../../components/PasswordInput"

export interface NoteData {
  id: number
	title: string
	content: string
	created_at: string
	important: boolean
	reminder: string | Date | null
}

export interface NoteLocked extends NoteData {
  title: 'locked',
  content: 'locked',
  needAPassword: true
}

interface NotePageProps {
  data: NoteData | NoteLocked
}

const NotePage: NextPage<NotePageProps> = ({ data }) => {
  const router = useRouter()
  const { noteId } = router.query
  const [ password, setPassword ] = useState('')
  const [ previousNoteData, setPreviousNoteData ] = useState(data)
  const [ noteData, setNoteData ] = useState(data)
  const [ showNewPasswordInput, setShowNewPasswordInput ] = useState(false)
  const [ newPassword, setNewPassword ] = useState('')
  const [ incorrectPasswordError, setIncorrectPasswordError ] = useState(false)
  const [ startDate, setStartDate ] = useState<Date | null>(
    data.reminder ? new Date(data.reminder) : null
  )
  const editOptionRef = useRef<HTMLLIElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const RequestController = {
    submitPassword: async () => {
      try {
        const response = await http.get(`/notes/${noteId}`, {
          headers: {
            Authorization: password
          }
        })
    
        setPreviousNoteData(response.data)
        setNoteData(response.data)
      } catch (error: any) {
        if(error.message === 'Request failed with status code 403') setIncorrectPasswordError(true)
        else console.log(error)
      }
    },

    updateNote: async () => {
      try {
        await http.patch(`/notes/${noteData.id}`, noteData)
  
        closeEditOption()
        setPreviousNoteData(noteData)
      } catch (error: any) {
        console.log(error)
      }
    },

    deleteNote: async () => {
      try {
        await http.delete(`/notes/${noteData.id}`)

        router.push('/')
      } catch (error: any) {
        console.log(error)
      }
    },

    changePassword: async () => {
      try {
        await http.patch(`/notes/${noteData.id}`, {
          password: newPassword
        })
  
        closeEditOption()
        setShowNewPasswordInput(false)
      } catch (error: any) {
        console.log(error)
      }
    }
  }

  const resizeTextArea = () => {
    if(textAreaRef.current === null) return

    textAreaRef.current.style.height = '40px';
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 12}px`
  }

  const showEditOption = () => {
    if(editOptionRef.current) editOptionRef.current.style.display = 'block'
  }

  const closeEditOption = () => {
    if(editOptionRef.current) editOptionRef.current.style.display = 'none'
  }

  const backToHomePage = () => {
    if(previousNoteData.content.length === 0 && previousNoteData.title.length === 0) {
      RequestController.deleteNote()
    }
    router.push('/')
  }

  useEffect(() => {
    resizeTextArea()
  }, [])

  useEffect(() => {
    if(JSON.stringify(previousNoteData) !== JSON.stringify(noteData)) showEditOption()
    else closeEditOption()
  }, [ noteData, previousNoteData ])

  if('needAPassword' in noteData)
    return (
      <PasswordInput
        onInputChange={e => {
          setPassword(e.target.value)
          setIncorrectPasswordError(false)

        }}
        onPasswordSubmit={RequestController.submitPassword}
        incorrectPasswordError={incorrectPasswordError}
        onArrowBackClick={() => router.push('/')}
      />
    )

  return (
    <div className={styles.note_page}>
      {
        showNewPasswordInput && 
        <PasswordInput
         onInputChange={e => setNewPassword(e.target.value)}
         onPasswordSubmit={RequestController.changePassword}
         onArrowBackClick={() => setShowNewPasswordInput(false)}
         isToChangeThePassword
        />
      }

      <header className={styles.header}>
        <button className={styles.back_button} title='Return to home page' onClick={backToHomePage}>
          <Image src={arrowBackIcon} alt='arrow back' />
        </button>

        <ul className={styles.actions}>
          <li
           ref={editOptionRef} 
           className={styles.edit_option} 
           onClick={RequestController.updateNote}
           title='update note'
          >
            <Image src={checkmarkIcon} alt='checkmark icon' />
          </li>
          <li>
            <label htmlFor="datePicker">
              <Image src={clockIcon} alt='clock icon' title='add a reminder' />
            </label>
            <div className={styles.datepicker}>
              <DatePicker
                selected={startDate} 
                minDate={new Date()}
                showTimeInput
                timeInputLabel="Time:"
                isClearable
                showMonthDropdown
                showYearDropdown
                clearButtonClassName={styles.clear_button}
                dropdownMode="select"
                onChange={date => {
                  setStartDate(date)
                  setNoteData({ ...noteData, reminder: date })
                }}
                className={styles.datepicker_input}
                id="datePicker"
              />
            </div>
          </li>
          <li
           className={`${styles.toggle_important_option} ${noteData.important ? styles.active : ''}`}
           onClick={() => setNoteData({ ...noteData, important: !noteData.important })}
          >
            <Image src={alertCircleIcon} alt='alert circle icon' title='toggle important' />
          </li>
          <li onClick={() => setShowNewPasswordInput(true)}>
            <Image src={padlockIcon} alt='padlock icon' title='add/change password' />
          </li>
          <li onClick={RequestController.deleteNote}>
            <Image src={trashIcon} alt='trash icon' title='delete note' />
          </li>
        </ul>
      </header>

      <div className={styles.content}>
        <input
         className={styles.title} 
         placeholder='Title ...' 
         spellCheck='false'
         defaultValue={noteData.title}
         onChange={e => setNoteData({ ...noteData, title: e.target.value })}
        />
        <textarea
         className={styles.message} 
         onInput={resizeTextArea} 
         placeholder='write something ...'
         spellCheck="false"
         defaultValue={noteData.content}
         onChange={e => setNoteData({ ...noteData, content: e.target.value })}
         ref={textAreaRef}
        />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { noteId } = context.query
  let noteData: NoteData | NoteLocked

  try {
    const response = await axios.get(`http://server:5000/notes/${noteId}`)
    
    noteData = response.data
  } catch (error: any) {
    console.log(error.message)
    return {
      redirect: {
        destination: '/',
        statusCode: 302
      }
    }
  }

  return {
    props: {
      data: noteData
    }
  }
}

export default NotePage