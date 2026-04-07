import { Link } from 'react-router-dom'
import StarIcon from '../assets/StarIcon.svg'


export function FeaturedCourseCard({ course }) {
  const { id, title, description, instructorName, price, imageUrl, rating } = course;

  const formattedPrice = `$${price}`;

  return (
    <div className="flex flex-col w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-[550px]">
      
      {/* Image Section */}
      <div className="w-full h-60 bg-gray-100 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 mt-4">
        
        {/* Lecturer & Rating Info */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>Lecturer: {instructorName}</span>
          
          <div className="flex items-center gap-1">
            {rating ? (
              <>
                <img src={StarIcon} alt="" className="size-4" aria-hidden />
                <span className="font-bold text-gray-700">{rating}</span>
              </>
            ) : (
              <span></span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {description}
        </p>

        {/* Price & Button */}
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="flex justify-between items-center gap-2">
            <span className="block text-xs text-gray-400 uppercase">Starting from</span>
            <span className="text-xl font-bold text-gray-900">{formattedPrice}</span>
          </div>

          <Link
            to={`/courses/${id}`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
