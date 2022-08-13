import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ChangeEvent, useState } from 'react'

import arrowBackIcon from '../../../public/arrow-back.svg'
import padlockIcon from '../../../public/padlock.svg'

import styles from './style.module.scss'

interface PasswordInputProps {
  onPasswordSubmit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  incorrectPasswordError?: boolean
  onArrowBackClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  isToChangeThePassword?: boolean
}

export const PasswordInput = ({
   onPasswordSubmit, 
   onInputChange, 
   incorrectPasswordError=false,
   onArrowBackClick,
   isToChangeThePassword=false
  }: PasswordInputProps) => { 
    const [ newPassword, setNewPassword ] = useState('') 
    const [ confimPassword, setConfirmPassword ] = useState('')
    const mismatchError =
     (newPassword.length >0 && confimPassword.length > 0) 
     ? newPassword !== confimPassword
     : false

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if(isToChangeThePassword) {
        setNewPassword(event.target.value)
      }

      onInputChange(event)
    }

    return (
      <div className={styles.password_input_component}>
        <header className={styles.header}>
          <button className={styles.back_button} onClick={onArrowBackClick}>
            <Image src={arrowBackIcon} alt='arrow back' />
          </button>
        </header>
        <div className={styles.content}>
          <div className={styles.image_box}>
            <Image src={padlockIcon} alt='padlock' />
          </div>
          <input
           type="password" 
           placeholder={isToChangeThePassword ? "new password" : "password" }
           onChange={handleChange}
          />
          {
            isToChangeThePassword &&
            <input
             type="password" 
             placeholder="confirm password" 
             onChange={e => setConfirmPassword(e.target.value)}
            />
          }
          {
            (incorrectPasswordError || mismatchError)
            && <span className={styles.password_error}>{
              incorrectPasswordError ? "Incorrect password"
              : mismatchError ? "The Confirm Password does not match" : ""
            }</span>
          }
          <button onClick={onPasswordSubmit} disabled={mismatchError}>Submit</button>
          
        </div>
      </div>
    )
}