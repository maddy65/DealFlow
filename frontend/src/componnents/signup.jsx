import React, {useState} from 'react'
import styles from './signup.module.css'

export default function Signup({onToggle}){
  const [form, setForm] = useState({name:'',email:'',password:'',confirm:''})
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})

  function handleChange(e){
    const {name,value} = e.target
    setForm(prev => ({...prev,[name]:value}))
  }

  function validate(){
    const errs = {}
    if(!form.name.trim()) errs.name = 'Please enter your full name.'
    if(!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = 'Enter a valid email.'
    if(form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if(form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    if(!agree) errs.agree = 'You must accept the terms.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e){
    e.preventDefault()
    if(!validate()) return
    console.log('Sign up', {...form})
    alert('Signup submitted — integrate with your backend.')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.logo}>DF</div>
            <div>
              <div style={{fontWeight:700,color:'#e6eef8'}}>DealFlow</div>
              <div className={styles.small}>Organize. Track. Grow.</div>
            </div>
          </div>

          <div className={styles.heroTitle}>Create your account</div>
          <div className={styles.heroText}>Quickly set up your account and get access to DealFlow’s deal tracking tools. Secure, fast, and built for founders and investors.</div>

          <svg className={styles.illustration} width="260" height="160" viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="240" height="120" rx="16" fill="url(#g)" opacity="0.18"/>
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#06b6d4"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className={styles.right}>
          <div>
            <div className={styles.formTitle}>Sign up</div>
            <div className={styles.formSub}>Join DealFlow — free for early access.</div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <input name="name" value={form.name} onChange={handleChange} className={styles.input} placeholder="Full name" aria-label="Full name" />
            {errors.name && <div className={styles.error}>{errors.name}</div>}

            <input name="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="Email address" aria-label="Email address" />
            {errors.email && <div className={styles.error}>{errors.email}</div>}

            <div className={styles.row}>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="Password" aria-label="Password" />
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className={styles.input} placeholder="Confirm password" aria-label="Confirm password" />
            </div>
            {errors.password && <div className={styles.error}>{errors.password}</div>}
            {errors.confirm && <div className={styles.error}>{errors.confirm}</div>}

            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
            {errors.agree && <div className={styles.error}>{errors.agree}</div>}

            <button type="submit" className={styles.submit}>Create account</button>
            <div className={styles.footer}>Already have an account? <button type="button" onClick={() => onToggle && onToggle('login')} style={{background:'none',border:'none',color:'#cfefff',fontWeight:700,cursor:'pointer',padding:0}}>Log in</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}
