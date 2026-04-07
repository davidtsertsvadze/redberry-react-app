import { useParams } from 'react-router-dom'

export default function CourseDetails() {
  const { courseId } = useParams()

  return (
    <section className="p-8 text-left">
      <h1>Course details</h1>
      {courseId != null && <p className="mt-2 text-neutral-600">Course ID: {courseId}</p>}
    </section>
  )
}
