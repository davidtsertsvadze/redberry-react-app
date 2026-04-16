import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchCourseDetails,
  fetchSessionTypes,
  fetchTimeSlots,
  fetchWeeklySchedules,
} from '../api/courses'
import { useAuth } from '../context/AuthContext'
import IconSet from '../assets/Icon_Set.svg'
import StarIcon from '../assets/StarIcon.svg'
import CalendarIcon from '../assets/calendar.svg'
import ClockIcon from '../assets/clock.svg'
import ArrowIcon from '../assets/arrow.svg'

function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '$0'
  return `$${Math.round(n)}`
}

function formatRating(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.0'
  return n.toFixed(1)
}

function formatPriceModifier(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 'Included'
  return `+$${Math.round(n)}`
}

function toCompactScheduleLabel(value) {
  const text = String(value ?? '')
  if (!text) return 'Schedule'
  return text
    .replace(/monday/gi, 'Mon')
    .replace(/tuesday/gi, 'Tue')
    .replace(/wednesday/gi, 'Wed')
    .replace(/thursday/gi, 'Thu')
    .replace(/friday/gi, 'Fri')
    .replace(/saturday/gi, 'Sat')
    .replace(/sunday/gi, 'Sun')
}

function getTimeSlotParts(label) {
  const text = String(label ?? '').trim()
  const [titlePart, metaPart] = text.split('(')
  return {
    title: titlePart?.trim() || 'Time Slot',
    meta: metaPart ? metaPart.replace(')', '').trim() : '',
  }
}

function TimeSlotIcon({ title }) {
  const key = title.toLowerCase()
  const iconClass = 'size-8 shrink-0 text-[#666666]'

  if (key.includes('morning')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path d="M4 14a5 5 0 0 1 5-5h5a6 6 0 1 1 0 12H7a3 3 0 0 1 0-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 3v2M4.5 4.5l1.4 1.4M3 8h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (key.includes('afternoon')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (key.includes('evening') || key.includes('night')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
        <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4A9.8 9.8 0 0 1 15.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return <img src={ClockIcon} alt="" width={24} height={24} className="size-6 shrink-0" aria-hidden />
}

export default function CourseDetails() {
  const { courseId } = useParams()
  const { isAuthenticated, openLoginModal } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [weeklySchedules, setWeeklySchedules] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [sessions, setSessions] = useState([])
  const [enrollmentError, setEnrollmentError] = useState('')

  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [openSection, setOpenSection] = useState('weekly')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCoursePage() {
      setLoading(true)
      setError('')

      try {
        const courseRow = await fetchCourseDetails(courseId, controller.signal)
        setCourse(courseRow)
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err?.message || 'Could not load course details.')
      } finally {
        setLoading(false)
      }
    }

    loadCoursePage()
    return () => controller.abort()
  }, [courseId])

  useEffect(() => {
    const controller = new AbortController()

    async function loadWeeklySchedules() {
      if (!courseId) return
      try {
        setEnrollmentError('')
        const rows = await fetchWeeklySchedules(courseId, controller.signal)
        setWeeklySchedules(rows)
        setSelectedScheduleId((currentId) => {
          if (rows.length === 0) return ''
          return rows.some((row) => String(row.id) === String(currentId)) ? currentId : String(rows[0].id)
        })
      } catch (err) {
        if (err?.name === 'AbortError') return
        setEnrollmentError(err?.message || 'Could not load schedule options.')
        setWeeklySchedules([])
      }
    }

    loadWeeklySchedules()
    return () => controller.abort()
  }, [courseId])

  useEffect(() => {
    if (!selectedScheduleId) {
      setTimeSlots([])
      setSelectedTimeSlotId('')
      setSessions([])
      setSelectedSessionId('')
      return
    }
    const controller = new AbortController()

    async function loadTimeSlots() {
      try {
        setEnrollmentError('')
        const rows = await fetchTimeSlots(courseId, selectedScheduleId, controller.signal)
        setTimeSlots(rows)
        setSelectedTimeSlotId((currentId) => {
          if (rows.length === 0) return ''
          return rows.some((row) => String(row.id) === String(currentId)) ? currentId : String(rows[0].id)
        })
      } catch (err) {
        if (err?.name === 'AbortError') return
        setEnrollmentError(err?.message || 'Could not load time slots.')
        setTimeSlots([])
        setSelectedTimeSlotId('')
      }
    }

    loadTimeSlots()
    return () => controller.abort()
  }, [courseId, selectedScheduleId])

  useEffect(() => {
    if (!selectedScheduleId || !selectedTimeSlotId) {
      setSessions([])
      setSelectedSessionId('')
      return
    }
    const controller = new AbortController()

    async function loadSessionTypes() {
      try {
        setEnrollmentError('')
        const rows = await fetchSessionTypes(courseId, selectedScheduleId, selectedTimeSlotId, controller.signal)
        setSessions(rows)
        setSelectedSessionId((currentId) => {
          if (rows.length === 0) return ''
          const hasCurrent = rows.some(
            (row) => String(row.id) === String(currentId) && Number(row.seats) > 0,
          )
          if (hasCurrent) return currentId
          const nextAvailable = rows.find((row) => Number(row.seats) > 0)
          return String((nextAvailable || rows[0]).id)
        })
      } catch (err) {
        if (err?.name === 'AbortError') return
        setEnrollmentError(err?.message || 'Could not load session types.')
        setSessions([])
        setSelectedSessionId('')
      }
    }

    loadSessionTypes()
    return () => controller.abort()
  }, [courseId, selectedScheduleId, selectedTimeSlotId])

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedSessionId)) || null,
    [sessions, selectedSessionId],
  )

  const basePrice = course?.basePrice ?? 0
  const sessionExtra = selectedSession?.priceDelta ?? 0
  const totalPrice = basePrice + sessionExtra

  const handleEnroll = () => {
    if (!isAuthenticated) {
      openLoginModal()
    }
  }

  const canPickTimeSlot = Boolean(selectedScheduleId) && timeSlots.length > 0
  const canPickSessionType = Boolean(selectedScheduleId) && Boolean(selectedTimeSlotId) && sessions.length > 0

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1920px] bg-[#F5F5F5] px-6 py-12 text-left sm:px-12 lg:px-[176px]">
        <p className="text-base font-medium text-[#666666]">Loading course details...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-[1920px] bg-[#F5F5F5] px-6 py-12 text-left sm:px-12 lg:px-[176px]">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      </section>
    )
  }

  return (
    <section className="mx-auto mb-[225px] w-full max-w-[1920px] bg-[#F5F5F5] px-6 py-[64px] text-left sm:px-12 lg:px-[176px]">
      <div className="mb-8 flex items-center gap-2 text-[18px] font-medium text-[#666666]">
        <Link to="/" className="no-underline">
          Home
        </Link>
        <span>›</span>
        <Link to="/courses" className="no-underline">
          Browse
        </Link>
        <span>›</span>
        <span className="text-[#4F46E5]">{course?.category}</span>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
        <div className="w-full max-w-[903px]">
          <h1 className="text-[40px] font-semibold leading-none text-[#141414]">{course?.title}</h1>

          <div className="mt-6 h-[474px] w-full overflow-hidden rounded-[10px] bg-[#E5E5E5]">
            {course?.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[15px] font-medium text-[#666666]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <img src={CalendarIcon} alt="" width={16} height={16} className="shrink-0" aria-hidden />
                {course?.durationWeeks} Weeks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <img src={ClockIcon} alt="" width={16} height={16} className="shrink-0" aria-hidden />
                {course?.hours} Hours
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[15px] text-[#666666]">
                <img src={StarIcon} alt="" width={16} height={16} className="shrink-0" aria-hidden />
                {formatRating(course?.avgRating)}
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-md bg-[#FFFFFF] px-3 py-2 text-center text-[16px] font-medium leading-6 text-[#666666]">
                    <img src={IconSet} alt="" width={18} height={18} className="shrink-0" aria-hidden />
                    {course?.category}
              </span>
            </div>   
          </div>

          <div className="mt-5 flex items-center gap-2 bg-[#FFFFFF] rounded-[10px] px-3 py-2 min-w-[200px] shrink-0 w-fit">
            {course?.instructor?.avatar ? (
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="size-8 rounded-[4px] object-cover"
              />
            ) : null}
            <p className="text-[16px] font-medium text-[#666666] whitespace-nowrap">
              {course?.instructor?.name}
            </p>
          </div>

          <h2 className="mt-[18px] text-[20px] font-semibold leading-none text-[#8A8A8A]">Course Description</h2>
          <p className="mt-6 text-[16px] font-medium leading-6 text-[#525252]">{course?.description}</p>
        </div>

        <aside className="w-full max-w-[530px] rounded-[12px] border border-[#E5E5E5] bg-white p-6">
          <div className="space-y-5 border-b border-[#E5E5E5] pb-5">
            <section>
              <button
                type="button"
                onClick={() => setOpenSection((current) => (current === 'weekly' ? '' : 'weekly'))}
                className="mb-3 flex w-full items-center justify-between"
              >
                <p className="inline-flex items-center gap-3 text-[30px] font-semibold leading-none text-[#141B70]">
                  <span className="inline-flex size-8 items-center justify-center rounded-full border-2 border-current text-[20px]">1</span>
                  Weekly Schedule
                </p>
                <img
                  src={ArrowIcon}
                  alt=""
                  width={24}
                  height={24}
                  className={`shrink-0 cursor-pointer transition-transform ${openSection === 'weekly' ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {openSection === 'weekly' ? (
                <div className="grid grid-cols-4 gap-3">
                  {weeklySchedules.map((schedule) => {
                    const isActive = String(schedule.id) === String(selectedScheduleId)
                    return (
                      <button
                        key={schedule.id}
                        type="button"
                        onClick={() => {
                          setSelectedScheduleId(String(schedule.id))
                          setOpenSection('timeSlot')
                        }}
                        className={`h-[66px] rounded-[16px] border text-[18px] font-semibold transition ${
                          isActive
                            ? 'border-[#D1D1D1] bg-[#FFFFFF] text-[#333333]'
                            : 'border-[#D0D0D0] bg-[#F5F5F5] text-[#2F2F2F] hover:border-[#BDBDBD]'
                        }`}
                      >
                        {toCompactScheduleLabel(schedule.label)}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>

            <section>
              <button
                type="button"
                onClick={() => setOpenSection((current) => (current === 'timeSlot' ? '' : 'timeSlot'))}
                className="mb-3 flex w-full items-center justify-between"
              >
                <p
                  className={`inline-flex items-center gap-3 text-[30px] font-semibold leading-none ${
                    canPickTimeSlot ? 'text-[#141B70]' : 'text-[#B8B8B8]'
                  }`}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full border-2 border-current text-[20px]">2</span>
                  Time Slot
                </p>
                <img
                  src={ArrowIcon}
                  alt=""
                  width={24}
                  height={24}
                  className={`shrink-0 cursor-pointer transition-transform ${openSection === 'timeSlot' ? 'rotate-180' : ''} ${
                    canPickTimeSlot ? '' : 'opacity-40'
                  }`}
                  aria-hidden
                />
              </button>
              {openSection === 'timeSlot' ? (
                <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
                  {timeSlots.map((slot) => {
                    const isActive = String(slot.id) === String(selectedTimeSlotId)
                    const { title, meta } = getTimeSlotParts(slot.label)
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlotId(String(slot.id))
                          setOpenSection('sessionType')
                        }}
                        className={`flex h-[61px] w-full items-center gap-[10px] rounded-[12px] border p-[15px] text-left transition sm:w-[172.6667px] ${
                          isActive
                            ? 'border-[#7B78FF] bg-[#EEEDFC] text-[#4F46E5]'
                            : 'border-[#D1D1D1] bg-[#FFFFFF] text-[#666666] hover:border-[#BDBDBD]'
                        }`}
                      >
                        <TimeSlotIcon title={title} />
                        <span className="min-w-0">
                          <p className="text-[14px] font-medium leading-[100%] tracking-[0]">{title}</p>
                          <p className={`mt-[4px] text-[10px] font-normal leading-[100%] tracking-[0] ${isActive ? 'text-[#4F46E5]' : 'text-[#666666]'}`}>
                            {meta}
                          </p>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>

            <section>
              <button
                type="button"
                onClick={() => setOpenSection((current) => (current === 'sessionType' ? '' : 'sessionType'))}
                className="mb-3 flex w-full items-center justify-between"
              >
                <p
                  className={`inline-flex items-center gap-3 text-[30px] font-semibold leading-none ${
                    canPickSessionType ? 'text-[#141B70]' : 'text-[#B8B8B8]'
                  }`}
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full border-2 border-current text-[20px]">3</span>
                  Session Type
                </p>
                <img
                  src={ArrowIcon}
                  alt=""
                  width={24}
                  height={24}
                  className={`shrink-0 cursor-pointer transition-transform ${openSection === 'sessionType' ? 'rotate-180' : ''} ${
                    canPickSessionType ? '' : 'opacity-40'
                  }`}
                  aria-hidden
                />
              </button>
              {openSection === 'sessionType' ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {sessions.map((session) => {
                    const isActive = String(session.id) === String(selectedSessionId)
                    const isFullyBooked = Number(session.seats) === 0
                    const hasLowSeats = Number(session.seats) > 0 && Number(session.seats) < 5
                    return (
                      <div key={session.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isFullyBooked) setSelectedSessionId(String(session.id))
                          }}
                          disabled={isFullyBooked}
                          className={`w-full rounded-[14px] border px-4 py-4 text-center transition ${
                            isFullyBooked
                              ? 'cursor-not-allowed border-[#D0D0D0] bg-[#ECECEC] text-[#C8C8C8]'
                              : isActive
                              ? 'border-[#7B78FF] bg-[#D3D1EE] text-[#484BE5]'
                              : 'border-[#D0D0D0] bg-[#F5F5F5] text-[#2F2F2F] hover:border-[#BDBDBD]'
                          }`}
                        >
                          <p className="text-[18px] font-semibold">{session.name}</p>
                          {session.location ? (
                            <p className={`mt-1 text-[14px] ${isFullyBooked ? 'text-[#C8C8C8]' : 'text-current'}`}>
                              {session.location}
                            </p>
                          ) : (
                            <p className={`mt-1 text-[14px] ${isFullyBooked ? 'text-[#C8C8C8]' : 'text-current'}`}>
                              Google Meet
                            </p>
                          )}
                          <p className="mt-2 text-[16px] font-semibold">{formatPriceModifier(session.priceDelta)}</p>
                        </button>
                        {isFullyBooked ? (
                          <p className="mt-2 text-center text-[16px] font-medium text-[#555555]">Fully Booked</p>
                        ) : hasLowSeats ? (
                          <p className="mt-2 text-center text-[16px] font-medium text-[#D4A027]">
                            Only {session.seats} seats left!
                          </p>
                        ) : (
                          <p className="mt-2 text-center text-[16px] font-medium text-[#3E3E3E]">
                            {session.seats} Seats Available
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </section>

            {enrollmentError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{enrollmentError}</p>
            ) : null}
          </div>

          <div className="mt-5 rounded-[10px] bg-[#FAFAFA] p-4">
            <div className="flex items-start justify-between">
              <p className="text-[28px] font-semibold leading-none text-[#525252]">Total Price</p>
              <p className="text-[40px] font-semibold leading-none text-[#141414]">{formatPrice(totalPrice)}</p>
            </div>
            <div className="mt-4 space-y-2 text-[16px] text-[#666666]">
              <div className="flex items-center justify-between">
                <span>Base Price</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Type Modifier</span>
                <span>{formatPriceModifier(sessionExtra)}</span>
              </div>
              
            </div>
            <button
              type="button"
              onClick={handleEnroll}
              className="mt-5 inline-flex h-[48px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#4F46E5] px-6 text-[16px] font-semibold text-white"
            >
              Enroll Now
            </button>
          </div>
          {!isAuthenticated ? (
            <div className="mt-6 h-[102px] w-full max-w-[530px] rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] p-[20px]">
              <div className="flex h-full items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[16px] font-medium leading-6 text-[#292929]">Authentication Required</p>
                  <p className="mt-1 text-[12px] font-normal leading-3 text-[#8A8A8A]">
                    You need sign in to your profile before enrolling in this course.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="inline-flex h-[46px] w-[91px] shrink-0 items-center justify-center gap-[6px] rounded-[8px] border border-[#B7B3F4] bg-[#EEEDFC] px-[12px] py-[10px] text-center text-[14px] font-normal leading-[26px] text-[#281ED2]"
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
