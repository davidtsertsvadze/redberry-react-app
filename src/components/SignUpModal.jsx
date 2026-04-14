import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'h-[48px] w-full rounded-[8px] border-[1.5px] border-[#D1D1D1] px-[13px] py-[12px] text-[14px] font-medium text-[#141414] outline-none placeholder:text-[#8A8A8A] focus:border-[#4F46E5]'

/** Extra right padding so text does not sit under the eye icon */
const passwordInputClass = `${inputClass} pr-12`

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

function UploadArrowIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden className="text-[#ADADAD]">
      <path d="M12 16V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m8.5 10.5 3.5-3.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16.5V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function SignUpModal({ open, onClose }) {
  const location = useLocation()
  const { completeAuth, openLoginModal } = useAuth()

  const fileInputRef = useRef(null)

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [avatarError, setAvatarError] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!open) {
      setAvatarPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return ''
      })
      return
    }

    setStep(1)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setUsername('')
    setAvatarFile(null)
    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setAvatarError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setSubmitting(false)
    setServerMessage('')
    setFieldErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

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

  if (!open) {
    return null
  }

  function goToLogin() {
    onClose()
    openLoginModal()
  }

  function goNextFromStep1() {
    setServerMessage('')
    setFieldErrors({})

    if (!email.trim()) {
      setServerMessage('Email is required.')
      return
    }
    if (!emailLooksOk(email)) {
      setServerMessage('Enter a valid email address.')
      return
    }
    setStep(2)
  }

  function goNextFromStep2() {
    setServerMessage('')
    setFieldErrors({})

    if (password.length < 3) {
      setServerMessage('Password must be at least 3 characters.')
      return
    }
    if (confirmPassword !== password) {
      setServerMessage('Passwords do not match.')
      return
    }
    setStep(3)
  }

  function pickAvatarFile(fileList) {
    setAvatarError('')
    setFieldErrors((prev) => ({ ...prev, avatar: undefined }))

    const file = fileList?.[0]

    setAvatarPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })

    if (!file) {
      setAvatarFile(null)
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const ok = ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp'
    if (!ok) {
      setAvatarFile(null)
      setAvatarError('Please use JPG, PNG, or WebP only.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAvatarFile(file)
    setAvatarPreviewUrl(URL.createObjectURL(file))
  }

  function onAvatarFileChange(e) {
    pickAvatarFile(e.target.files)
  }

  function onAvatarDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    pickAvatarFile(e.dataTransfer.files)
  }

  function onAvatarDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function onSignUpClick() {
    setServerMessage('')
    setFieldErrors({})

    if (username.trim().length < 3) {
      setServerMessage('Username must be at least 3 characters.')
      return
    }

    setSubmitting(true)
    try {
      const data = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        avatar: avatarFile,
      })
      const fromDashboard = location.pathname === '/'
      completeAuth(data, { fromDashboard })
    } catch (err) {
      const fe = err.fieldErrors || {}
      setFieldErrors(fe)
      setServerMessage(err.message || 'Registration failed.')

      if (fe.email) setStep(1)
      else if (fe.password || fe.password_confirmation) setStep(2)
      else if (fe.username || fe.avatar) setStep(3)
    } finally {
      setSubmitting(false)
    }
  }

  const orLoginFooter = (
    <div className="mt-6 w-full">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#E6E6E6]" />
        <span className="text-[14px] text-[#8A8A8A]">or</span>
        <div className="h-px flex-1 bg-[#E6E6E6]" />
      </div>
      <p className="mt-4 text-center text-[14px] text-[#666666]">
        Already have an account?{' '}
        <button type="button" className="font-semibold text-[#141414] underline cursor-pointer" onClick={goToLogin}>
          Log In
        </button>
      </p>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
      onClick={onClose}
    >
      <div
        className="min-h-[580px] w-[460px] max-h-[90vh] overflow-y-auto rounded-[12px] bg-white p-[50px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              aria-label="Previous step"
              className="text-[40px] leading-none text-[#8A8A8A] cursor-pointer"
              onClick={() => setStep(step - 1)}
            >
              ‹
            </button>
          ) : (
            <span className="w-[26px]" />
          )}
          <button
            type="button"
            aria-label="Close"
            className="text-[42px] leading-none text-[#8A8A8A] cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <h2 id="signup-modal-title" className="text-center text-[32px] font-semibold text-[#141414]">
          Create Account
        </h2>
        <p className="mt-3 text-center text-[14px] font-medium text-[#666666]">Join and start learning today</p>

        <div className="mt-3 flex gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#4F46E5]' : 'bg-[#E9E7FF]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#4F46E5]' : 'bg-[#E9E7FF]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#4F46E5]' : 'bg-[#E9E7FF]'}`} />
        </div>

        {serverMessage ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">{serverMessage}</p>
        ) : null}

        {step === 1 && (
          <div className="mt-4">
            <label htmlFor="signup-email" className={labelClass}>
              Email*
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
            {fieldErrors.email ? <p className="mt-1 text-[12px] text-red-600">{fieldErrors.email}</p> : null}

            <button
              type="button"
              className="mt-4 h-[47px] w-full rounded-[8px] bg-[#4F46E5] text-[16px] font-medium text-white cursor-pointer"
              onClick={goNextFromStep1}
            >
              Next
            </button>
            {orLoginFooter}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <label htmlFor="signup-password" className={labelClass}>
              Password*
            </label>
            <div className="relative w-full">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={passwordInputClass}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5"
                onClick={() => setShowPassword((v) => !v)}
              >
                <PasswordEyeIcon passwordVisible={showPassword} />
              </button>
            </div>
            {fieldErrors.password ? <p className="mt-1 text-[12px] text-red-600">{fieldErrors.password}</p> : null}

            <label htmlFor="signup-confirm" className={`${labelClass} mt-4`}>
              Confirm Password*
            </label>
            <div className="relative w-full">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Password"
                className={passwordInputClass}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                <PasswordEyeIcon passwordVisible={showConfirmPassword} />
              </button>
            </div>
            {fieldErrors.password_confirmation ? (
              <p className="mt-1 text-[12px] text-red-600">{fieldErrors.password_confirmation}</p>
            ) : null}

            <button
              type="button"
              className="mt-4 h-[47px] w-full rounded-[8px] bg-[#4F46E5] text-[16px] font-medium text-white cursor-pointer"
              onClick={goNextFromStep2}
            >
              Next
            </button>
            {orLoginFooter}
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <label htmlFor="signup-username" className={labelClass}>
              Username*
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className={inputClass}
            />
            {fieldErrors.username ? <p className="mt-1 text-[12px] text-red-600">{fieldErrors.username}</p> : null}

            <p className={`${labelClass} mt-4`}>Upload Avatar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onAvatarFileChange}
            />

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragOver={onAvatarDragOver}
              onDrop={onAvatarDrop}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-[#8B82FF] bg-white px-4 py-6 text-center"
            >
              {avatarPreviewUrl ? (
                <img src={avatarPreviewUrl} alt="Avatar preview" className="max-h-[120px] w-full object-contain" />
              ) : (
                <>
                  <UploadArrowIcon />
                  <p className="mt-3 text-[14px] font-medium text-[#666666]">
                    Drag and drop or{' '}
                    <span
                      className="text-[#4F46E5] underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      Upload file
                    </span>
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[#ADADAD]">JPG, PNG or WebP</p>
                </>
              )}
            </div>
            {avatarError || fieldErrors.avatar ? (
              <p className="mt-1 text-[12px] text-red-600">{avatarError || fieldErrors.avatar}</p>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              className="mt-4 h-[47px] w-full rounded-[8px] bg-[#4F46E5] text-[16px] font-medium text-white disabled:opacity-60 cursor-pointer"
              onClick={onSignUpClick}
            >
              {submitting ? '…' : 'Sign Up'}
            </button>
            {orLoginFooter}
          </div>
        )}
      </div>
    </div>
  )
}
