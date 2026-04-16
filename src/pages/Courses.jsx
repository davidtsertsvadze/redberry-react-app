import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories, fetchCourses, fetchInstructors, fetchTopics } from '../api/courses'
import StarIcon from '../assets/StarIcon.svg'
import IconSet from '../assets/Icon_Set.svg'
import ArrowIcon from '../assets/arrow.svg'

function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '$0'
  return `$${Math.round(n)}`
}

function formatRating(value) {
  return Number(value).toFixed(1)
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title_asc', label: 'Title: A-Z' },
]

function SortChevron({ open }) {
  return (
    <img
      src={ArrowIcon}
      alt=""
      width={16}
      height={16}
      className={`shrink-0 cursor-pointer transition-transform ${open ? 'rotate-180' : ''}`}
      aria-hidden
    />
  )
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selected = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort courses"
        onClick={() => setOpen((v) => !v)}
        className="box-border flex h-[45px] min-w-[234px] cursor-pointer items-center gap-[10px] rounded-[10px] border border-[#F5F5F5] bg-white px-5 py-[10px] text-left font-sans text-base font-medium leading-6 tracking-normal outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
      >
        <span className="min-w-0 flex-1 truncate">
          <span className="text-[#666666]">Sort By: </span>
          <span className="text-[#4F46E5]">{selected.label}</span>
        </span>
        <SortChevron open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-[calc(100%+4px)] z-20 w-[234px] overflow-hidden rounded-[10px] border border-[#E5E5E5] bg-white py-1 shadow-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`flex w-full items-center px-5 py-2.5 text-left font-sans text-base font-medium leading-6 tracking-normal transition-colors ${
                  opt.value === value
                    ? 'bg-[#DDDBFA] text-[#4F46E5]'
                    : 'text-[#666666] hover:bg-[#DDDBFA] hover:text-[#4F46E5]'
                }`}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Courses() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState('newest')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedInstructors, setSelectedInstructors] = useState([])
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [instructors, setInstructors] = useState([])
  const [courses, setCourses] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFilters() {
      try {
        const [categoryRows, topicRows, instructorRows] = await Promise.all([
          fetchCategories(controller.signal),
          fetchTopics(controller.signal),
          fetchInstructors(controller.signal),
        ])
        setCategories(categoryRows)
        setTopics(topicRows)
        setInstructors(instructorRows)
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    loadFilters()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { courses: rows, meta } = await fetchCourses(currentPage, sort, controller.signal, {
          categories: selectedCategories,
          topics: selectedTopics,
          instructors: selectedInstructors,
        })
        setCourses(rows)
        setTotalPages(meta.lastPage)
        setTotalCourses(meta.total)
      } catch (e) {
        if (e.name === 'AbortError') return
        setError(e.message ?? 'Could not load courses')
        setCourses([])
        setTotalPages(1)
        setTotalCourses(0)
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [currentPage, selectedCategories, selectedInstructors, selectedTopics, sort])

  const toggleFilter = (id, setState) => {
    setState((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
    setCurrentPage(1)
  }
  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedTopics([])
    setSelectedInstructors([])
    setCurrentPage(1)
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const resultsLabel =
    !loading && !error && totalCourses === 0
      ? 'No courses found'
      : !loading && !error
        ? `Showing ${courses.length} out of ${totalCourses}`
        : ''
  const activeFilters = selectedCategories.length + selectedTopics.length + selectedInstructors.length

  return (
    <section className="mx-auto mt-32 mb-40 flex w-[1920px] max-w-full items-start justify-center gap-20 text-left">
      <aside className="w-[300px] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[40px] font-semibold leading-none text-[#0A0A0A]">Filters</h2>
          <button
            type="button"
            onClick={clearAllFilters}
            className="cursor-pointer text-[16px] font-medium leading-6 text-[#8A8A8A]"
            style={{ fontFamily: 'Inter' }}
          >
            Clear All Filters X
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-[#666666]">Categories</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleFilter(category.id, setSelectedCategories)}
                className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-center text-[16px] font-medium leading-6 ${
                  selectedCategories.includes(category.id)
                    ? 'border-[#281ED2] bg-[#EEEDFC] text-[#281ED2]'
                    : 'border-transparent bg-[#FFFFFF] text-[#666666]'
                }`}
              >
                <img src={IconSet} alt="" width={18} height={18} className="shrink-0" aria-hidden />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-lg font-medium text-[#666666]">Topics</h3>
          <div className="mt-6 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleFilter(topic.id, setSelectedTopics)}
                className={`inline-flex cursor-pointer rounded-xl border px-3 py-2 text-[16px] font-medium leading-5 ${
                  selectedTopics.includes(topic.id)
                    ? 'border-[#281ED2] bg-[#EEEDFC] text-[#281ED2]'
                    : 'border-transparent bg-[#FFFFFF] text-[#666666]'
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 border-b border-[#ADADAD] pb-6">
          <h3 className="text-lg font-medium text-[#666666]">Instructor</h3>
          <div className="mt-6 flex flex-col gap-2">
            {instructors.map((instructor) => (
              <button
                key={instructor.id}
                type="button"
                onClick={() => toggleFilter(instructor.id, setSelectedInstructors)}
                className={`inline-flex w-fit cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-[16px] font-medium transition-colors ${
                  selectedInstructors.includes(instructor.id)
                    ? 'border-[#281ED2] bg-[#EEEDFC] text-[#281ED2]'
                    : 'border-transparent bg-[#FFFFFF] text-[#666666]'
                }`}
              >
                {instructor.avatar ? (
                  <img
                    src={instructor.avatar}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 rounded-full object-cover"
                    aria-hidden
                  />
                ) : null}
                {instructor.name}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-[#ADADAD]">{activeFilters} Filters Active</p>
      </aside>

      <div className="w-full max-w-[1160px]">
        <div className="mb-8 flex min-h-12 items-center justify-between gap-4 rounded-lg bg-[#F5F5F5]">
          <p className="text-sm font-medium text-[#525252]">
            {loading ? '…' : error ? '' : resultsLabel}
          </p>
          <SortDropdown
            value={sort}
            onChange={(next) => {
              setSort(next)
              setCurrentPage(1)
            }}
          />
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-[#525252]">Loading courses…</p>
        ) : (
        <div className="grid justify-items-center gap-6 grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group flex h-[451px] w-[373px] flex-col gap-6 rounded-[12px] border border-[#F5F5F5] bg-white p-5 no-underline transition-transform"
            >
              <div className="h-[195px] w-full overflow-hidden rounded-[10px] bg-[#F0F0F0]">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-[#ADADAD]">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-[14px] font-medium leading-none text-[#ADADAD]">
                    {course.instructorName} | {course.durationLabel}
                  </p>
                  {course.rating != null && (
                    <div className="flex shrink-0 items-center gap-1">
                      <img src={StarIcon} alt="" className="size-4" aria-hidden />
                      <span className="text-[14px] font-semibold leading-none text-[#0A0A0A]">
                        {formatRating(course.rating)}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="mt-3 text-[24px] font-semibold leading-none text-[#0A0A0A]">
                  {course.title}
                </h2>

                <span className="my-5 inline-flex w-fit items-center gap-2 rounded-md bg-[#F5F5F5] px-3 py-2 text-center text-[16px] font-medium leading-6 text-[#666666]">
                  <img src={IconSet} alt="" width={18} height={18} className="shrink-0" aria-hidden />
                  {course.category}
                </span>

                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#ADADAD]">
                      Starting from
                    </p>
                    <p className="mt-1 text-[24px] font-semibold leading-none text-[#333333]">
                      {formatPrice(course.startingPrice)}
                    </p>
                  </div>

                  <span className="inline-flex h-[48px] w-[103px] items-center justify-center rounded-[8px] bg-[#4F46E5] px-[25px] py-[17px] text-[14px] font-semibold leading-none text-white">
                    Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {!loading && !error && totalCourses > 0 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="box-border inline-flex size-10 cursor-pointer items-center justify-center rounded-[4px] border border-[#D1D1D1] bg-white text-base font-medium leading-none text-[#4F46E5] disabled:cursor-not-allowed disabled:text-[#D1D1D1]"
            aria-label="Previous page"
          >
            ←
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`box-border inline-flex size-10 cursor-pointer items-center justify-center rounded-[4px] border text-base font-medium leading-none ${
                currentPage === page
                  ? 'border-[#4F46E5] bg-[#281ED2] text-white'
                  : 'border-[#D1D1D1] bg-white text-[#4F46E5]'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="box-border inline-flex size-10 cursor-pointer items-center justify-center rounded-[4px] border border-[#D1D1D1] bg-white text-base font-medium leading-none text-[#4F46E5] disabled:cursor-not-allowed disabled:text-[#D1D1D1]"
            aria-label="Next page"
          >
            →
          </button>
        </div>
        )}
      </div>
    </section>
  )
}
