import type { ComponentPropsWithRef } from 'react'
import './Input.css'

type InputProps = ComponentPropsWithRef<'input'>

function Input(props: InputProps) {
  return <input className="input" {...props} />
}

export default Input 