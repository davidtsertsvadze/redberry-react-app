import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Images from assets
import slide1Img from '../assets/hero-1.png'
import slide2Img from '../assets/hero-2.png'
import slide3Img from '../assets/hero-3.png'

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Start learning something new today',
    description: 'Explore a wide range of expert-led courses in design, development, business, and more.',
    ctaTo: '/courses',
    ctaLabel: 'Browse Courses',
    image: slide1Img,
  },
  {
    id: 2,
    title: 'Pick up where you left off',
    description: 'Your learning journey is already in progress. Continue your enrolled courses and track your progress.',
    ctaTo: '/courses',
    ctaLabel: 'Start Learning',
    image: slide2Img,
  },
  {
    id: 3,
    title: 'Learn together, grow faster',
    description: 'Join our community of learners and experts to accelerate your career growth.',
    ctaTo: '/courses',
    ctaLabel: 'Learn More',
    image: slide3Img,
  },
]

export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const currentSlide = HERO_SLIDES[index]

  // 1. Simple Next/Prev Logic
  const nextSlide = () => {
    setIndex(index === HERO_SLIDES.length - 1 ? 0 : index + 1)
  }

  const prevSlide = () => {
    setIndex(index === 0 ? HERO_SLIDES.length - 1 : index - 1)
  }

  // 2. Simple Auto-play logic
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [index]) // Restarts timer whenever index changes

  return (
    <section className="bg-[#F5F5F5] px-6 pt-8 sm:px-12 lg:px-[177px]">
      <div
        className="relative mx-auto flex h-[420px] w-full max-w-[1566px] flex-col gap-3 overflow-hidden rounded-[30px] p-12 text-white transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(19,14,103,0.72), rgba(10,10,10,0.28)), url(${currentSlide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="max-w-[780px] text-[48px] font-bold leading-none">
          {currentSlide.title}
        </h1>

        <p className="max-w-[1020px] text-[24px] font-light text-white/90">
          {currentSlide.description}
        </p>

        <Link
          to={currentSlide.ctaTo}
          className="mt-4 inline-flex h-[64px] w-[206px] items-center justify-center rounded-[8px] bg-[#4F46E5] text-[20px] font-medium text-white no-underline hover:opacity-90"
        >
          {currentSlide.ctaLabel}
        </Link>

        <div className="mt-auto flex items-center justify-between">
          {/* Dots Indicator */}
          <div className="mx-auto flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  index === i ? 'w-10 bg-white' : 'w-6 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="grid size-12 place-items-center rounded-full border border-white/60 bg-black/10 text-2xl text-white"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="grid size-12 place-items-center rounded-full border border-white/60 bg-black/10 text-2xl text-white"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}