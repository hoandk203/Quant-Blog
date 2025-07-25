'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Send,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
    { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
    { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
    { icon: <Youtube className="w-4 h-4" />, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bài viết', href: '/posts' },
    { label: 'Về chúng tôi', href: '/about' },
  ];

  const legalLinks = [
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Điều khoản sử dụng', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'DMCA', href: '/dmca' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                QuantBlog
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm">
              Nền tảng blog tiên tiến, giúp bạn chia sẻ 
              kiến thức và kết nối với cộng đồng một cách dễ dàng.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="text-gray-600 dark:text-gray-400 w-4 h-4" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  hoanyttv@gmail.com
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="text-gray-600 dark:text-gray-400 w-4 h-4" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  +84 123 456 789
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="text-gray-600 dark:text-gray-400 w-4 h-4" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">
                  Hà Nội, Việt Nam
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Liên kết nhanh
            </h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Pháp lý
            </h3>
            <div className="space-y-3">
              {legalLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Kết nối với chúng tôi
            </h3>
            
            <div className="flex gap-2 mb-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-200 rounded-lg flex items-center justify-center"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Đăng ký nhận thông báo về bài viết mới
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 text-sm border-gray-300 dark:border-gray-600"
              />
              <Button className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} QuantBlog. Tất cả quyền được bảo lưu.
            </p>
            
            <div className="flex items-center gap-6">
              <Link
                href="/sitemap.xml"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-200"
              >
                Sitemap
              </Link>
              <Link
                href="/rss.xml"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm transition-colors duration-200"
              >
                RSS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 