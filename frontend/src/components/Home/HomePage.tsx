'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react';
import MainLayout from '../Layout/MainLayout';
import ClientSidePosts from './ClientSidePosts';
import FeaturedPosts from './FeaturedPosts';
import { Post } from '../../types';
import { useAppSelector } from '../../store';
import '../../styles/hero-section.css';

const AuthenticatedActions = ({ user, mounted }: { user: any; mounted: boolean }) => {
  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-white text-primary-600 hover:brightness-105 shadow-xl px-8 py-4 rounded-xl font-semibold transition-all duration-200">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl px-8 py-4 rounded-xl font-semibold">
          Tham gia ngay
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/posts/create">
          <Button size="lg" className="bg-white text-primary-600 hover:brightness-105 shadow-xl px-8 py-4 rounded-xl font-semibold transition-all duration-200">
            Tạo bài viết mới
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/my-posts">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl px-8 py-4 rounded-xl font-semibold"
          >
            Quản lý bài viết
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/posts">
        <Button size="lg" className="bg-white text-primary-600 hover:brightness-105 shadow-xl px-8 py-4 rounded-xl font-semibold transition-all duration-200">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button
          variant="outline"
          size="lg"
          className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl px-8 py-4 rounded-xl font-semibold"
        >
          Tham gia ngay
        </Button>
      </Link>
    </div>
  );
};

const HomePage = () => {
  const { user: reduxUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  const user = reduxUser;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Background Pattern - Subtle Geometric Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
                <Sparkles className="h-4 w-4" />
                Nền tảng chia sẻ kiến thức
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              Chia sẻ kiến thức,
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">kết nối cộng đồng</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed font-normal">
              Nơi những ý tưởng được lan tỏa và kiến thức được chia sẻ một cách có ý nghĩa
            </p>

            <AuthenticatedActions user={user} mounted={mounted} />

          </div>
        </div>
      </section>

      <FeaturedPosts />
      <ClientSidePosts user={user}/>

      {mounted && !isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Bắt đầu hành trình viết blog
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Chia sẻ kiến thức của bạn với cộng đồng và xây dựng thương hiệu cá nhân một cách chuyên nghiệp
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/auth/register" className="flex-1">
                  <Button size="lg" className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl px-8 py-4 rounded-xl font-semibold">
                    Tạo tài khoản
                  </Button>
                </Link>
                <Link href="/about" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white shadow-lg px-8 py-4 rounded-xl font-semibold">
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default HomePage; 