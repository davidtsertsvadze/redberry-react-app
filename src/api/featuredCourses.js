/**
 * Configuration Constants
 */
const REDBERRY_API_BASE = 'https://api.redclass.redberryinternship.ge/api';

const GET_BASE_URL = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (envBase) return envBase;
  if (import.meta.env.DEV) return '/api';
  return REDBERRY_API_BASE;
};

const FEATURED_URL = `${GET_BASE_URL()}/courses/featured`;
const MOCK_URL = '/mock-featured.json';
const USE_MOCK = import.meta.env.VITE_USE_FEATURED_MOCK === 'true';

/** 
 * Maps API course shape to internal UI shape.
 */
function mapFeaturedCourse(c) {
  const rawRating = Number(c.avgRating);
  const rating = (c.avgRating != null && c.avgRating !== '' && Number.isFinite(rawRating)) 
    ? rawRating 
    : null;

  return {
    id: String(c.id ?? ''),
    title: c.title ?? 'Untitled Course',
    description: c.description ?? '',
    imageUrl: c.image || null,
    price: Number(c.basePrice) || 0,
    instructorName: c.instructor?.name ?? 'Instructor',
    rating,
  };
}

/**
 * Main Fetch Function
 */
export async function fetchFeaturedCourses(signal) {
  const url = USE_MOCK ? MOCK_URL : FEATURED_URL;

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    
    const rows = Array.isArray(json) ? json : (json?.data ?? []);
    
    return rows.map(mapFeaturedCourse);
  } catch (error) {

    if (error.name === 'AbortError') throw error;
    
    console.error('Featured Courses Fetch Error:', error);
    throw error;
  }
}