'use client';

import Link from 'next/link';
import Image from 'next/image';
import { JSX } from 'react';
import { MailIcon } from 'lucide-react';

// You can define a type for social links for better maintenance
type SocialLink = {
  name: string;
  href: string;
  icon: JSX.Element;
};

// Simple SVG icons for social media
const FacebookIcon = () => (
  <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
  </svg>
);

export default function Footer() {
  const socialLinks: SocialLink[] = [
    { name: 'Facebook', href: '#', icon: <FacebookIcon /> },
    { name: 'Twitter', href: '#', icon: <TwitterIcon /> },
    { name: 'Instagram', href: '#', icon: <InstagramIcon /> },
    { name: 'Mail', href: '#', icon: <MailIcon /> },
  ];

  return (
    <footer className="bg-[#E3E8E8] text-gray-700 body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        {/* Logo and Copyright */}
        <Link href="/home" className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
          <Image src="/Logo.png" alt="PetConnect logo" width={80} height={80} />
          <span className="ml-3 text-xl font-bold tracking-wide px-3 py-1 bg-green-100/50 text-green-800 rounded-full">Colombia</span>
        </Link>
        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
          © 2025 PetConnect —
          <a href="#" className="text-gray-600 ml-1" rel="noopener noreferrer" target="_blank">@petconnectco</a>
        </p>
        
        {/* Contact Info */}
        <div className="sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <p className="text-sm text-gray-500"> Email: petconnect.contacto@gmail.com</p>
            <p className="text-sm text-gray-500">Teléfono: +57 123 456 7890</p>
        </div>

        {/* Social Media Links */}
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          {socialLinks.map((social) => (
            <a key={social.name} href={social.href} className="text-gray-500 hover:text-[#3DD9D6] transition-colors ml-3">
              {social.icon}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
