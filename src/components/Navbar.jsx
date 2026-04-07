import { Link } from 'react-router-dom'
import logoUrl from '../assets/Logo.svg'
import SparklesIcon from '../assets/SparklesIcon.svg'

export function Navbar() {
  return (
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

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#4F46E5] bg-transparent px-6 py-4 text-[15px] font-medium leading-none text-[#4F46E5]"
        >
          Log In
        </button>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-transparent bg-[#4F46E5] px-6 py-4 text-[15px] font-medium leading-none text-white"
        >
          Sign Up
        </button>
      </nav>
    </header>
  )
}
