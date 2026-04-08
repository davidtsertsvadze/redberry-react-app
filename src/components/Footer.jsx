import { Link } from 'react-router-dom'
import logoUrl from '../assets/Logo.svg'

import facebookIcon from '../assets/Facebook.svg'
import instagramIcon from '../assets/Instagram.svg'
import linkedInIcon from '../assets/LinkedIn.svg'
import twitterIcon from '../assets/Twitter.svg'
import youtubeIcon from '../assets/YouTube.svg'
import PhoneIcon from '../assets/Phone.svg'
import MailIcon from '../assets/Mail.svg'
import AddressIcon from '../assets/Address.svg'

export function Footer() {
  return (
    <footer className="h-[334px] w-full max-w-[1920px] border-t border-[#D9D9D9] bg-[#F5F5F5] px-[177px]">
      <div className="h-full py-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="flex flex-col justify-start max-w-[320px]">
            <Link to="/" className="inline-flex gap-3 no-underline">
              <img src={logoUrl} alt="Bootcamp logo" className="size-[45px] rounded-[8px]" />
              <span className="text-2xl font-semibold text-[#130E67]">Bootcamp</span>
            </Link>
            <p className="mt-4 text-sm text-left text-[#130E67]">
              Your learning journey starts here! Browse courses to get started.
            </p>
            <div className="mt-4 flex  gap-3">
              <a href="#" aria-label="Facebook">
                <img src={facebookIcon} alt="" className="size-5" aria-hidden />
              </a>
              <a href="#" aria-label="Twitter">
                <img src={twitterIcon} alt="" className="size-5" aria-hidden />
              </a>
              <a href="#" aria-label="Instagram">
                <img src={instagramIcon} alt="" className="size-5" aria-hidden />
              </a>
              <a href="#" aria-label="LinkedIn">
                <img src={linkedInIcon} alt="" className="size-5" aria-hidden />
              </a>
              <a href="#" aria-label="YouTube">
                <img src={youtubeIcon} alt="" className="size-5" aria-hidden />
              </a>
            </div>
          </div>

          <div className="grid gap-8 grid-cols-3">
            <div className='justify-items-start'>
              <h3 className="text-xl font-semibold text-[#130E67]">Explore</h3>
              <ul className="mt-3 list-none space-y-2 p-0 text-[#666666]">
                <li>
                  <Link to="/courses" className="no-underline">
                    Enrolled Courses
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="no-underline">
                    Browse Courses
                  </Link>
                </li>
              </ul>
            </div>

            <div className='justify-items-start'>
              <h3 className="text-xl font-semibold text-[#130E67]">Account</h3>
              <ul className="mt-3 list-none space-y-2 p-0 text-[#666666]">
                <li>
                  <a href="#" className="no-underline">
                    My Profile
                  </a>
                </li>
              </ul>
            </div>

            <div className='justify-items-start'>
              <h3 className="text-xl font-semibold text-[#130E67]">Contact</h3>
              <ul className="mt-3 list-none space-y-2 p-0 text-[#666666]">
                <li className="flex items-center gap-2">
                    <img src={MailIcon} alt="" className="size-5" />    
                    <p>contact@company.com</p>
                </li>
                <li className="flex items-center gap-2">
                    <img src={PhoneIcon} alt="" className="size-5" />
                    <p>(+995) 555 11 222</p>
                </li>
                <li className="flex items-center gap-2">
                    <img src={AddressIcon} alt="" className="size-5" />
                   <p> Aghmashenebeli St.115</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 pt-6 text-lg text-[#666666] flex-row items-center justify-between">
          <p>Copyright © 2026 Redberry International</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>All Rights Reserved |</span>
            <a href="#" className="text-[#4F46E5] no-underline">
              Terms and Conditions
            </a>
            <span>|</span>
            <a href="#" className="text-[#4F46E5] no-underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
