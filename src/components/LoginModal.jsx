import { useEffect, useState } from 'react'
import { loginUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'h-[48px] w-full rounded-[8px] border-[1.5px] border-[#D1D1D1] px-[13px] py-[12px] text-[14px] font-medium text-[#141414] outline-none placeholder:text-[#8A8A8A] focus:border-[#4F46E5]'

const labelClass = 'mb-1 block text-left text-[14px] font-medium text-[#141414]'

function emailLooksOk(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function PasswordEyeIcon({ passwordVisible }) {
  if (passwordVisible) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M1.5 12C2.67 8.85 6.58 5 12 5c5.42 0 9.33 3.85 10.5 7-1.17 3.15-5.08 7-10.5 7-5.42 0-9.33-3.85-10.5-7Z"
          stroke="#ADADAD"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" stroke="#ADADAD" strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3l18 18" stroke="#ADADAD" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.73 5.08C11.15 5.03 11.57 5 12 5c5.5 0 9.5 4.3 10.5 7-0.42 1.14-1.38 2.58-2.78 3.83M14.12 14.12A3 3 0 0 1 9.88 9.88"
        stroke="#ADADAD"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M6.1 6.1C4.5 7.3 3.4 9.05 3 12c1 2.7 5 7 9 7 1.52 0 2.92-.4 4.17-1.06" stroke="#ADADAD" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function LoginModal({ open, onClose }) {
  const { completeAuth, openSignupModal } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')

  useEffect(() => {
    if (!open) return

    setEmail('')
    setPassword('')
    setShowPassword(false)
    setSubmitting(false)
    setServerMessage('')

    document.body.style.overflow = 'hidden'
    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    if (!email.trim()) {
      setServerMessage('Email is required.')
      return
    }
    if (!emailLooksOk(email)) {
      setServerMessage('Enter a valid email address.')
      return
    }
    if (!password) {
      setServerMessage('Password is required.')
      return
    }

    setSubmitting(true)
    setServerMessage('')
    try {
      const data = await loginUser({ email: email.trim(), password })
      completeAuth(data)
      onClose()
    } catch (err) {
      setServerMessage(err?.message || 'Unable to log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={onClose}
    >
      <div
        className="w-[460px] rounded-[12px] bg-white p-[50px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label="Close"
            className="text-[42px] leading-none text-[#8A8A8A] cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <h2 id="login-modal-title" className="text-center text-[32px] font-semibold text-[#141414]">
        Welcome Back
        </h2>
        <p className="mt-3 text-center text-[14px] font-medium text-[#666666]">Log in to continue your learning</p>

        {serverMessage ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
            {serverMessage}
          </p>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className={labelClass}>
              Email*
            </label>
            <input
              id="login-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="login-password" className={labelClass}>
              Password*
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <PasswordEyeIcon passwordVisible={showPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex h-[48px] w-full items-center justify-center rounded-[8px] bg-[#4F46E5] px-4 text-[16px] cursor-pointer font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center text-[14px] text-[#666666]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-semibold text-[#141414] underline cursor-pointer"
            onClick={() => {
              onClose()
              openSignupModal()
            }}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
