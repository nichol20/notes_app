import { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"

import { NoteData, NoteLocked } from "../../pages/notes/[noteId]"
import { HighlightedText } from "../HighlightedText"
import { SelectionModeBox } from "../SelectionModeBox"

import padlockIcon from '../../../public/padlock.svg'
import chainImg from '../../../public/chain.svg'
import alertCircleIcon from '../../../public/alert-circle.svg'

import styles from './style.module.scss'


interface NoteCardProps {
  note: NoteData | NoteLocked
  searchQuery: string
  selectedCardIds: number[]
  setSelectedCardIds: Dispatch<SetStateAction<number[]>>
}

export const NodeCard = ({ note, searchQuery, selectedCardIds, setSelectedCardIds  }: NoteCardProps) => {
  const router = useRouter()
  const creationDate = String(new Date(note.created_at)).split(' ')
  const [ timeoutId, setTimeoutId ] = useState<NodeJS.Timeout>()

  const handleOnMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const timeout = setTimeout(() => {
      setSelectedCardIds(prev => {
        const newData = [...prev]
        newData.push(note.id)
        return newData
      })
    }, 1000)
    setTimeoutId(timeout)
  }

  const handleOnMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    clearTimeout(timeoutId)
    if(selectedCardIds.length === 0) {
      router.push(`/notes/${note.id}`)
    }
  }

  const toggleSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedCardIds(prev => {
      if(prev.filter(id => id === note.id).length === 0 && event.target.checked) {
        const newData = [...prev]
        newData.push(note.id)
        return newData
      } else {
        return prev.filter(id => id !== note.id)
      }
    })
  }
  
  return (
    <div className={styles.note} onMouseDown={handleOnMouseDown} onMouseUp={handleOnMouseUp} >
      {
        selectedCardIds.length > 0 && (
          <SelectionModeBox
           checked={selectedCardIds.filter(id => id === note.id).length > 0}
           onChange={toggleSelection}
         />
        )
      }
      {
        note.important
        && (
          <div className={styles.alert_circle_box}>
            <Image src={alertCircleIcon} alt='alert circle icon' />
          </div>
        )
      }
      {
        'needAPassword' in note
        ? (
          <div className={styles.locked_content}>
            <div className={styles.chain_box}>
              <Image src={chainImg} alt='chain' layout='fixed' />
              <Image src={chainImg} alt='chain' layout='fixed' />
            </div>
            <div className={styles.padlock_box}>
              <Image src={padlockIcon} alt='padlock' />
            </div>
            </div>
        )
        : (
          <>
            <h3 className={styles.title}>
              {
                note.title.length > 0 
                ? <HighlightedText text={note.title} snippet={searchQuery} />
                : <HighlightedText text={note.content} snippet={searchQuery} />
              }
            </h3>
            <p className={styles.content}>
              <HighlightedText text={note.content} snippet={searchQuery} />
            </p>
            <span className={styles.creation_date}>
              {`${creationDate[1]} ${creationDate[2]} ${creationDate[3]}`}
            </span>
          </>
        )
      }
    </div>
  )
}
