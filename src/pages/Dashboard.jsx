import { useEffect, useState } from 'react'
import { FeaturedCourses, HeroSlider } from '../components'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { isAuthenticated, expandCoursesInProgress, clearExpandCoursesInProgress } = useAuth()
  const [coursesInProgressOpen, setCoursesInProgressOpen] = useState(false)

  useEffect(() => {
    if (expandCoursesInProgress) setCoursesInProgressOpen(true)
  }, [expandCoursesInProgress])

  useEffect(() => {
    return () => clearExpandCoursesInProgress()
  }, [clearExpandCoursesInProgress])

  return (
    <div className="text-left">
      <HeroSlider />

      {isAuthenticated && (
        <section className="border-b border-[#E5E5E5] bg-[#F5F5F5] px-6 py-10 sm:px-12 lg:px-[177px]">
          <details
            open={coursesInProgressOpen}
            onToggle={(event) => setCoursesInProgressOpen(event.target.open)}
            className="rounded-[12px] border border-[#E5E5E5] bg-white p-6"
          >
            <summary className="cursor-pointer list-none text-[28px] font-semibold text-[#0A0A0A] [&::-webkit-details-marker]:hidden">
              Courses in Progress
            </summary>
            <p className="mt-4 text-[16px] font-medium text-[#666666]">
              You have no courses in progress yet. Browse courses to enroll.
            </p>
          </details>
        </section>
      )}

      <FeaturedCourses />
    </div>
  )
}
