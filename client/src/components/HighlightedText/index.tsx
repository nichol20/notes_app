import React from 'react'
import { lowerCase } from '../../pages'

import styles from './style.module.scss'

interface HighlitedTextProps {
  text: string
  snippet: string
}

export const HighlightedText = ({ text, snippet }: HighlitedTextProps) => {
  if(snippet.length === 0) return <>{text}</>
  else {
    const splitedText = text.split(new RegExp(snippet, 'i')) 
    const matches: string[] = []
    let position: number = -1

    do {
      const initialIndex = lowerCase(text).indexOf(lowerCase(snippet), position + 1)
      const finalIndex = initialIndex + snippet.length
      if(initialIndex !== -1) matches.push(text.substring(initialIndex, finalIndex))
      position = initialIndex
    } while(position !== -1)

    return <>
      {
        splitedText.map((p, i) => {
          if(i < splitedText.length - 1) return (
            <>
              {p}<span className={styles.highlighted_text} key={i} style={{ color: "rgb(255, 80, 80)" }}>{
                matches[i]
              }</span>
            </>
          )
          else return p
        }) 
      }
    </>
  }
}

