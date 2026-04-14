import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'redberry_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(readStoredUser()))
  const [token, setToken] = useState(() => readStoredToken())
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const [expandCoursesInProgress, setExpandCoursesInProgress] = useState(false)

  const persistAuth = useCallback((nextToken, nextUser) => {
    const normalized = normalizeUser(nextUser)
    setToken(nextToken)
    setUser(normalized)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextToken, user: normalized }),
      )
    } catch {
      /* ignore */
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setExpandCoursesInProgress(false)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const openLoginModal = useCallback(() => {
    setSignupModalOpen(false)
    setLoginModalOpen(true)
  }, [])

  const openSignupModal = useCallback(() => {
    setLoginModalOpen(false)
    setSignupModalOpen(true)
  }, [])

  const completeAuth = useCallback(
    (data, { fromDashboard = false } = {}) => {
      persistAuth(data.token, data.user)
      setLoginModalOpen(false)
      setSignupModalOpen(false)
      if (fromDashboard) setExpandCoursesInProgress(true)
    },
    [persistAuth],
  )

  const clearExpandCoursesInProgress = useCallback(() => {
    setExpandCoursesInProgress(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      profileComplete: Boolean(user?.profileComplete),
      loginModalOpen,
      setLoginModalOpen,
      signupModalOpen,
      setSignupModalOpen,
      openLoginModal,
      openSignupModal,
      persistAuth,
      logout,
      completeAuth,
      expandCoursesInProgress,
      clearExpandCoursesInProgress,
    }),
    [
      user,
      token,
      loginModalOpen,
      signupModalOpen,
      persistAuth,
      logout,
      completeAuth,
      expandCoursesInProgress,
      clearExpandCoursesInProgress,
      openLoginModal,
      openSignupModal,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.user ?? null
  } catch {
    return null
  }
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const profileComplete = raw.profileComplete ?? raw.profile_complete
  return {
    ...raw,
    profileComplete: Boolean(profileComplete),
  }
}

function readStoredToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.token === 'string' ? parsed.token : null
  } catch {
    return null
  }
}
