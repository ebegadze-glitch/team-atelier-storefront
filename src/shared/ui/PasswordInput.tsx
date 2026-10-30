import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { ComponentPropsWithRef } from 'react'
import Input from './Input'
import './PasswordInput.css'

type PasswordInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type'
>

function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="password-input">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
      />

      <button
        className="password-toggle"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? t('password.hideAria') : t('password.showAria')}
      >
        {visible ? t('password.hide') : t('password.show')}
      </button>
    </div>
  )
}

export default PasswordInput 