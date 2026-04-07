import { useEffect, useState } from 'react'
import { fetchFeaturedCourses } from '../api/featuredCourses'
import { FeaturedCourseCard } from './FeaturedCourseCard'

export function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchFeaturedCourses();
        setCourses(data.slice(0, 3));
      } catch (err) {
        setError(true);
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
}, []);

  return (
    <section
      className="bg-[#F5F5F5] px-6 py-12 text-left sm:px-12 lg:px-[177px]"
    >
      <h2 className="text-[40px] font-semibold text-[#0A0A0A]">
        Start Learning Today
      </h2>
      <p className="mt-3 text-lg font-medium text-[#3D3D3D]">
        Choose from our most popular courses and begin your journey
      </p>

      {courses.length > 0 && (
        <ul className="mt-10 grid grid-cols-3 gap-8 list-none p-0" >
          {courses.map((course) => (
            <li key={course.id} className="w-full">
              <FeaturedCourseCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
