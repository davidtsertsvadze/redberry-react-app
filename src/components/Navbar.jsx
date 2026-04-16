import { Link } from 'react-router-dom'
import logoUrl from '../assets/Logo.svg'
import SparklesIcon from '../assets/SparklesIcon.svg'
import avatarIcon from '../assets/avatar.svg'
import { useAuth } from '../context/AuthContext'
import { LoginModal } from './LoginModal'
import { SignUpModal } from './SignUpModal'

export function Navbar() {
  const {
    user,
    isAuthenticated,
    loginModalOpen,
    setLoginModalOpen,
    signupModalOpen,
    setSignupModalOpen,
    openLoginModal,
    openSignupModal,
  } = useAuth()

  return (
    <>
      <header className="box-border flex h-[108px] w-full max-w-[1920px] items-center justify-between gap-[10px] border-b border-[#D1D1D1] bg-[#F5F5F5] px-[177px] py-[24px]">
        <Link to="/" className="flex shrink-0 items-center rounded-md">
          <img src={logoUrl} alt="Redberry" width={60} height={60} className="size-[60px]" />
        </Link>

        <nav className="flex items-center gap-[10px]" aria-label="Main">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-[15px] font-medium leading-none text-[#525252] no-underline"
          >
            <img src={SparklesIcon} alt="" className="size-5" aria-hidden />
            Browse Courses
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-[15px] font-medium leading-none text-[#525252] no-underline"
              >
                Enrolled Courses
              </Link>
              <Link
                to="/"
                aria-label={user?.username ? `${user.username} profile` : 'Profile'}
                className="ml-1 inline-flex items-center justify-center rounded-full"
              >
                <img src={avatarIcon} alt="" aria-hidden className="size-10 shrink-0" />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4F46E5] bg-transparent px-6 py-4 text-[15px] font-medium leading-none text-[#4F46E5]"
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => openSignupModal()}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-transparent bg-[#4F46E5] px-6 py-4 text-[15px] font-medium leading-none text-white"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <SignUpModal open={signupModalOpen} onClose={() => setSignupModalOpen(false)} />
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}
