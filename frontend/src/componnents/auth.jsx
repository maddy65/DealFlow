import React, {useState} from 'react'
import Signup from './signup'
import Login from './login'

export default function Auth(){
  const [mode, setMode] = useState('signup')
  return mode === 'signup' ? <Signup onToggle={m=> setMode(m)} /> : <Login onToggle={m=> setMode(m)} />
}
