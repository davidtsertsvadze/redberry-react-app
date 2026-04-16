const REDBERRY_API_BASE = 'https://api.redclass.redberryinternship.ge/api'

const getBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '')
  if (envBase) return envBase
  if (import.meta.env.DEV) return '/api'
  return REDBERRY_API_BASE
}

function mapCourse(c) {
  const rawRating = Number(c.avgRating)
  const rating =
    c.avgRating != null && c.avgRating !== '' && Number.isFinite(rawRating) ? rawRating : null
  const price = Number(c.basePrice)

  return {
    id: String(c.id ?? ''),
    title: c.title ?? 'Course',
    imageUrl: c.image || null,
    startingPrice: Number.isFinite(price) ? price : 0,
    durationLabel: `${c.durationWeeks ?? 0} Weeks`,
    instructorName: c.instructor?.name ?? 'Instructor',
    category: c.category?.name ?? '—',
    rating,
  }
}

/**
 * 
 * @param {number} page
 * @param {string} sort 
 */
export async function fetchCourses(page, sort, signal, filters = {}) {
  const params = new URLSearchParams({ page: String(page) })
  if (sort) params.set('sort', sort)
  const categories = Array.isArray(filters.categories) ? filters.categories : []
  const topics = Array.isArray(filters.topics) ? filters.topics : []
  const instructors = Array.isArray(filters.instructors) ? filters.instructors : []

  categories.forEach((id) => params.append('categories[]', String(id)))
  topics.forEach((id) => params.append('topics[]', String(id)))
  instructors.forEach((id) => params.append('instructors[]', String(id)))

  const url = `${getBaseUrl()}/courses?${params}`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })

  if (!res.ok) {
    throw new Error(`Failed to load courses (${res.status})`)
  }

  const json = await res.json()
  const rows = Array.isArray(json?.data) ? json.data : []
  const meta = json?.meta ?? {}

  return {
    courses: rows.map(mapCourse),
    meta: {
      currentPage: meta.currentPage ?? page,
      lastPage: Math.max(1, Number(meta.lastPage) || 1),
      perPage: Number(meta.perPage) || rows.length,
      total: Number(meta.total) || 0,
    },
  }
}

async function fetchFilterResource(path, signal) {
  const res = await fetch(`${getBaseUrl()}${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`)
  const json = await res.json()
  return Array.isArray(json?.data) ? json.data : []
}

export async function fetchCategories(signal) {
  const rows = await fetchFilterResource('/categories', signal)
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name ?? '',
    icon: row.icon ?? '',
  }))
}

export async function fetchTopics(signal) {
  const rows = await fetchFilterResource('/topics', signal)
  return rows.map((row) => ({
    id: Number(row.id),
    categoryId: Number(row.categoryId),
    name: row.name ?? '',
  }))
}

export async function fetchInstructors(signal) {
  const rows = await fetchFilterResource('/instructors', signal)
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name ?? '',
    avatar: row.avatar || null,
  }))
}

function mapCourseDetails(raw) {
  const c = raw && typeof raw === 'object' ? raw : {}
  const basePrice = Number(c.basePrice)
  const reviews = Array.isArray(c.reviews) ? c.reviews : []
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (Number(review?.rating) || 0), 0) / reviews.length
      : 0

  return {
    id: Number(c.id),
    title: c.title ?? 'Course',
    description: c.description ?? '',
    imageUrl: c.image || null,
    basePrice: Number.isFinite(basePrice) ? basePrice : 0,
    durationWeeks: Number(c.durationWeeks) || 0,
    hours: Number(c.hours) || 0,
    reviewCount: reviews.length,
    avgRating,
    category: c.category?.name ?? 'General',
    topic: c.topic?.name ?? '',
    instructor: {
      id: Number(c.instructor?.id) || 0,
      name: c.instructor?.name ?? 'Instructor',
      avatar: c.instructor?.avatar || null,
    },
    enrollment: c.enrollment ?? null,
  }
}

export async function fetchCourseDetails(courseId, signal) {
  const res = await fetch(`${getBaseUrl()}/courses/${courseId}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to load course details (${res.status})`)
  const json = await res.json()
  return mapCourseDetails(json?.data)
}

export async function fetchWeeklySchedules(courseId, signal) {
  const res = await fetch(`${getBaseUrl()}/courses/${courseId}/weekly-schedules`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to load weekly schedules (${res.status})`)
  const json = await res.json()
  const rows = Array.isArray(json?.data) ? json.data : []
  return rows.map((row) => ({
    id: Number(row.id),
    label: row.label ?? '',
    days: Array.isArray(row.days) ? row.days : [],
  }))
}

export async function fetchTimeSlots(courseId, weeklyScheduleId, signal) {
  const params = new URLSearchParams({ weekly_schedule_id: String(weeklyScheduleId) })
  const res = await fetch(`${getBaseUrl()}/courses/${courseId}/time-slots?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to load time slots (${res.status})`)
  const json = await res.json()
  const rows = Array.isArray(json?.data) ? json.data : []
  return rows.map((row) => ({
    id: Number(row.id),
    label: row.label ?? '',
    startTime: row.startTime ?? null,
    endTime: row.endTime ?? null,
  }))
}

function normalizeSessionName(value) {
  const text = String(value ?? '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
  if (!text) return 'Session'
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function fetchSessionTypes(courseId, weeklyScheduleId, timeSlotId, signal) {
  const params = new URLSearchParams({
    weekly_schedule_id: String(weeklyScheduleId),
    time_slot_id: String(timeSlotId),
  })
  const res = await fetch(`${getBaseUrl()}/courses/${courseId}/session-types?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to load session types (${res.status})`)
  const json = await res.json()
  const rows = Array.isArray(json?.data) ? json.data : []
  return rows.map((row) => {
    const priceDelta = Number(row.priceModifier)
    return {
      id: Number(row.id),
      name: normalizeSessionName(row.name),
      priceDelta: Number.isFinite(priceDelta) ? priceDelta : 0,
      seats: Number(row.availableSeats) || 0,
      location: row.location ?? null,
    }
  })
}
