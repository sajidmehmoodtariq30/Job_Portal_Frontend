import React from 'react'
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'
import logo from '../../assets/logo.png'

const Footer = () => {
  return (
    <footer className="relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 pointer-events-none" />
      
      <div className="relative bg-gray-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-gray-800">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-4 space-y-8">
              <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
                <img src={logo} alt="Commercial Electricians Australia" className="h-12 w-auto rounded-lg" />
                <div>
                  <h3 className="font-bold text-white">Commercial Electricians Australia</h3>
                  <p className="text-sm text-gray-400">Established 2011</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Founded in 2011, Commercial Electricians Australia has grown to become a national leader in delivering cutting-edge electrical solutions. With a strong focus on commercial, retail, and medical fitouts and maintenance.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-span-1 md:col-span-4">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                Contact Us
                <ArrowUpRight className="ml-2 h-4 w-4 text-blue-400" />
              </h3>
              <div className="space-y-4">
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition-colors">
                    <MapPin size={20} />
                  </div>
                  <span>Gold Coast, Australia</span>
                </a>
                <a href="tel:0755732111" 
                   className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition-colors">
                    <Phone size={20} />
                  </div>
                  <span>07 5573 2111</span>
                </a>
                <a href="mailto:Support@mygcce.com.au" 
                   className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition-colors">
                    <Mail size={20} />
                  </div>
                  <span>Support@mygcce.com.au</span>
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="col-span-1 md:col-span-4">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                Connect With Us
                <ArrowUpRight className="ml-2 h-4 w-4 text-blue-400" />
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/CommercialElectriciansAustralia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="p-4 rounded-2xl bg-gray-800 hover:bg-blue-600/20 transition-colors">
                    <Facebook size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/commercialelectricians/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="p-4 rounded-2xl bg-gray-800 hover:bg-purple-600/20 transition-colors">
                    <Instagram size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </a>
              </div>
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm">
                <p className="text-sm text-gray-300">
                  Follow us on social media for industry insights, project showcases, and company updates.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Commercial Electricians Australia. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Cool gradient line at the top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
    </footer>
  )
}

export default Footer