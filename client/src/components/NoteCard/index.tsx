import Link from "next/link"
import Image from "next/image"

import { NoteData, NoteLocked } from "../../pages/notes/[noteId]"

import padlockIcon from '../../../public/padlock.svg'
import chainImg from '../../../public/chain.svg'
import alertCircleIcon from '../../../public/alert-circle.svg'

import styles from './style.module.scss'

interface NoteCardProps {
  note: NoteData | NoteLocked
}

export const NodeCard = ({ note }: NoteCardProps) => {
  const creationDate = String(new Date(note.created_at)).split(' ')

  return (
    <Link href={`/notes/${note.id}`}>
      <div className={styles.note}>
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
                {note.title.length > 0 ? note.title : note.content}
              </h3>
              <p className={styles.content}>
                {note.content}
              </p>
              <span className={styles.creation_date}>
                {`${creationDate[1]} ${creationDate[2]} ${creationDate[3]}`}
              </span>
            </>
          )
        }
      </div>
    </Link>
  )
}