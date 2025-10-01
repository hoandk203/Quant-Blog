'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile, getUserPosts } from '../../../services/UserService';
import { PostCard } from '../../../components/Posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Eye, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: string;
  stats: {
    totalPosts: number;
    totalViews: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function ProfileUserPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostsResponse>({
    posts: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }
  });
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile(userId);
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPosts = async (page: number = 1) => {
    setLoadingPosts(true);
    try {
      const postsData = await getUserPosts(userId, page, 6);
      setPosts(postsData);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      setLoading(false);
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Profile Section */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Profile Card */}
              <Card className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-primary-200 dark:border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-primary-200 dark:ring-primary-800">
                          {profile.avatar ? (
                            <AvatarImage src={profile.avatar} alt={profile.name} />
                          ) : (
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 text-white">
                              {getInitials(profile.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">✓</span>
                        </div>
                      </div>
                    </div>

                    {/* Name & Bio */}
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-secondary-700 bg-clip-text text-transparent mb-4 tracking-tight">
                        {profile.name}
                      </h1>
                      {profile.bio && (
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed px-4">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-primary-200 dark:border-gray-700">
                      <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-md border-2 border-primary-100 dark:border-gray-600 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-center space-x-1 text-primary-600 dark:text-primary-400 mb-2">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-3xl text-gray-900 dark:text-white mb-1">
                          {profile.stats.totalPosts}
                        </div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Bài viết
                        </div>
                      </div>
                      <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-md border-2 border-secondary-100 dark:border-gray-600 hover:scale-105 transition-transform">
                        <div className="flex items-center justify-center space-x-1 text-secondary-600 dark:text-secondary-400 mb-2">
                          <Eye className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-3xl text-gray-900 dark:text-white mb-1">
                          {profile.stats.totalViews.toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Lượt xem
                        </div>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center justify-center space-x-2 text-base font-semibold text-gray-600 dark:text-gray-400 pt-4 px-4 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <span>Tham gia {formatDate(profile.createdAt)}</span>
                    </div>

                    {/* Social Links */}
                    {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) ? (
                      <div className="pt-4">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                          🔗 Mạng xã hội
                        </p>
                        <div className="flex items-center justify-center space-x-3">
                          {profile.socialLinks.website && profile.socialLinks.website.includes('facebook.com') && (
                            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="w-12 h-12 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                <FacebookIcon className="w-6 h-6" />
                              </Button>
                            </a>
                          )}
                          {profile.socialLinks.twitter && profile.socialLinks.twitter.includes('x.com') && (
                            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="w-12 h-12 p-0 rounded-xl bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                <XIcon className="w-6 h-6" />
                              </Button>
                            </a>
                          )}
                          {profile.socialLinks.linkedin && profile.socialLinks.linkedin.includes('linkedin.com') && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="w-12 h-12 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                <LinkedInIcon className="w-6 h-6" />
                              </Button>
                            </a>
                          )}
                          {profile.socialLinks.github && profile.socialLinks.github.includes('github.com') && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="w-12 h-12 p-0 rounded-xl bg-gray-800 hover:bg-black text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                                <GitHubIcon className="w-6 h-6" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 pt-4 px-4 py-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Chưa liên kết mạng xã hội
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Posts Section */}
          <div className="flex-1 min-w-0">
            <Card className="mb-8 bg-gradient-to-r from-primary-600 via-secondary-600 to-secondary-700 border-0 shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                  📝 Bài viết của {profile.name}
                </h2>
                <p className="text-white/90 text-lg">
                  {posts.pagination.totalItems} bài viết đã được xuất bản
                </p>
              </CardContent>
            </Card>

        {loadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {posts.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-12">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => loadPosts(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 h-12 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Trước</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, posts.pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => loadPosts(page)}
                          size="lg"
                          className={currentPage === page
                            ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg font-bold min-w-[48px] h-12 rounded-xl"
                            : "border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold min-w-[48px] h-12 rounded-xl"
                          }
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => loadPosts(currentPage + 1)}
                    disabled={currentPage === posts.pagination.totalPages}
                    className="flex items-center gap-2 px-6 h-12 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-20 px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-dashed border-primary-300 dark:border-gray-600">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {profile.name} chưa xuất bản bài viết nào. Hãy quay lại sau nhé! 📝
              </p>
            </CardContent>
          </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}