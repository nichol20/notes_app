import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'

import { http } from '../utils/http'
import axios from 'axios'
import { NodeCard } from '../components/NoteCard'
import { NoteData, NoteLocked } from './notes/[noteId]'

import searchIcon from '../../public/search.svg'
import addIcon from '../../public/add.svg'

import styles from '../styles/Home.module.scss'

export interface HomeProps {
  notes: NoteData[] | NoteLocked[]
}

const Home: NextPage<HomeProps> = ({ notes }) => {
  const router = useRouter()
  console.log(notes)

  const createNote = async () => {
    try {
      const { data } = await http.post('/notes', {
        content: ''
      })
      
      router.push(`/notes/${data.id}`)
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
        <input type="text" placeholder='Look for notes'/>
      </div>

      <div className={styles.notes_container}>
        {
          notes.map((note, index) => {
            if(note.important) return <NodeCard note={note} key={index} />
          })
        }
        {
          notes.map((note, index) => {
            if(!note.important) return <NodeCard note={note} key={index} />
          })
        }
        <button className={styles.add_note} onClick={createNote}>
          <div className={styles.image_box}>
            <Image src={addIcon} alt='add' />
          </div>
        </button>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  let data: NoteData[]

  try {
    const response = await axios.get('http://server:5000/notes')
    
    data = response.data
  } catch (error: any) {
    data = []
    console.log(error.message)
  }

  return {
    props: {
      notes: data
    }
  }
}

export default Home
