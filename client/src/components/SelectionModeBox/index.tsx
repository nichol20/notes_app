import React, { ChangeEvent } from 'react'

import styles from './style.module.scss'

interface SelectionModeBoxProps {
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const SelectionModeBox = ({ checked, onChange }: SelectionModeBoxProps) => {
  return (
    <label className={styles.selection_mode_box}>
      <div className={styles.checkbox_container}>
        <input type="checkbox"
          checked={checked} 
          onChange={onChange} 
        />
        <span className={styles.checkmark}></span>
      </div>
    </label>
  )
}