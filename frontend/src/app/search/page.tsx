'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search as SearchIcon,
  AccessTime,
  Visibility,
  ThumbUp,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchPosts, fetchBulkSaveStatus, optimisticToggleSave, togglePostSave } from '../../store/slices/postsSlice';
import { formatDate, calculateReadingTime } from '../../lib/utils';
import { getAllCategories } from '../../services/CategoryService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { posts, loading, error, pagination, saveStatus, saveLoading } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('date');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  // Debounce search query - chỉ gọi API sau 500ms kể từ lần gõ cuối
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Update search query when URL parameters change
  useEffect(() => {
    const queryFromUrl = searchParams?.get('q') || '';
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fetch posts when debounced search parameters change
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const params: any = {
        page: pagination.currentPage,
        limit: 9, // Show more results on search page
        search: debouncedSearchQuery.trim(),
      };

      if (category !== 'all') {
        params.category = category;
      }

      // Sort by logic (the API doesn't support all these sort options, but we can simulate them)
      // For now, we'll use the default sorting from API which is by publishedAt DESC
      dispatch(fetchPosts(params));
    }
  }, [debouncedSearchQuery, pagination.currentPage, category, dispatch]);

  // Fetch save status for posts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && posts.length > 0) {
      const slugs = posts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, isAuthenticated, posts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with new search query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const params: any = {
      page: value,
      limit: 9,
      search: debouncedSearchQuery.trim(),
    };

    if (category !== 'all') {
      params.category = category;
    }

    dispatch(fetchPosts(params));
  };

  const handleSaveToggle = async (slug: string) => {
    if (!isAuthenticated) return;

    // Optimistic update
    dispatch(optimisticToggleSave({ 
      slug, 
      saved: !saveStatus[slug] 
    }));

    // Call API
    dispatch(togglePostSave(slug));
  };

  const sortOptions = [
    { value: 'date', label: 'Mới nhất' },
    { value: 'views', label: 'Lượt xem' },
    { value: 'likes', label: 'Lượt thích' },
    { value: 'relevance', label: 'Độ liên quan' },
  ];

  // Sort posts client-side since API doesn't support all sort options
  const sortedPosts = React.useMemo(() => {
    if (!posts || posts.length === 0) return [];
    
    const sorted = [...posts];
    switch (sortBy) {
      case 'views':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'likes':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case 'relevance':
        // For relevance, we could implement a more complex scoring system
        // For now, we'll sort by a combination of likes and views
        return sorted.sort((a, b) => {
          const scoreA = (a.likeCount || 0) * 2 + (a.viewCount || 0) * 0.1;
          const scoreB = (b.likeCount || 0) * 2 + (b.viewCount || 0) * 0.1;
          return scoreB - scoreA;
        });
      case 'date':
      default:
        return sorted.sort((a, b) => 
          new Date(b.publishedAt || b.createdAt).getTime() - 
          new Date(a.publishedAt || a.createdAt).getTime()
        );
    }
  }, [posts, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Search Section */}
      <div className="mb-12 bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 rounded-3xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">
          Tìm kiếm bài viết
        </h1>
        <p className="text-lg text-white/90 text-center mb-8">
          Khám phá hàng ngàn bài viết về Quantitative Trading, Machine Learning và nhiều hơn nữa
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc thẻ..."
              className="pl-16 pr-6 h-16 text-lg rounded-2xl border-2 border-white/20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl focus:ring-4 focus:ring-white/30 transition-all"
            />
            {searchQuery && (
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-700 hover:to-primary-700 text-white rounded-xl px-8 font-bold shadow-lg"
              >
                Tìm kiếm
              </Button>
            )}
          </div>
          {/* Hiển thị indicator khi đang debounce */}
          {searchQuery !== debouncedSearchQuery && searchQuery.trim() && (
            <p className="text-sm text-white/80 mt-3 text-center flex items-center justify-center gap-2">
              <span className="animate-pulse">⏳</span> Đang tìm kiếm...
            </p>
          )}
        </form>
      </div>

      {/* Filters Bar */}
      <Card className="mb-8 shadow-lg border-2 border-primary-100 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                🗂️ Danh mục
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-primary-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="font-semibold">📚 Tất cả danh mục</span>
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                🔄 Sắp xếp theo
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-secondary-200 dark:border-gray-600 focus:ring-2 focus:ring-secondary-500">
                  <SelectValue placeholder="Chọn cách sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Count */}
      {debouncedSearchQuery && !loading && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-l-4 border-primary-600">
          <p className="text-gray-800 dark:text-gray-200 font-semibold">
            {pagination.totalItems > 0
              ? `✅ Tìm thấy ${pagination.totalItems} kết quả cho "${debouncedSearchQuery}"`
              : `❌ Không tìm thấy kết quả nào cho "${debouncedSearchQuery}"`
            }
          </p>
        </div>
      )}
    </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {!loading && sortedPosts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="group h-full flex flex-col relative bg-white dark:bg-gray-800 hover:shadow-2xl hover:-translate-y-2 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                {/* Save Button */}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 z-10 bg-gradient-to-br from-black/70 to-black/60 hover:from-black/90 hover:to-black/80 rounded-xl backdrop-blur-sm shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveToggle(post.slug);
                    }}
                  >
                    {saveStatus[post.slug] ? (
                      <Bookmark className="h-5 w-5 text-primary-400" />
                    ) : (
                      <BookmarkBorder className="h-5 w-5 text-white" />
                    )}
                  </Button>
                )}

                <Link href={`/posts/${post.slug}`} className="flex flex-col h-full text-decoration-none">
                  {post.featuredImage && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <CardContent className="flex-1 flex flex-col p-6">
                    <div className="mb-3">
                      <Badge className="bg-primary-600 text-white border-0 shadow-lg hover:bg-primary-700 transition-colors">
                        {post.category?.name || ''}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-base mb-4 line-clamp-3 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <Avatar className="h-8 w-8 mr-3 ring-2 ring-primary-200 dark:ring-primary-800">
                        <AvatarImage src={post.author?.avatar || ''} alt={post.author?.name || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold">
                          {post.author?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {post.author?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <AccessTime className="h-4 w-4 text-primary-600" />
                        <span className="font-medium">{post.readingTime || calculateReadingTime(post.content)} phút đọc</span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Visibility className="h-4 w-4 text-secondary-600" />
                          <span className="font-bold">{post.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbUp className="h-4 w-4 text-accent-600" />
                          <span className="font-bold">{post.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
                      📅 {formatDate(post.publishedAt || post.createdAt)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePageChange({} as any, page)}
                    className={page === pagination.currentPage
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg font-bold min-w-[48px] h-12 rounded-xl"
                      : "border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold min-w-[48px] h-12 rounded-xl"
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && debouncedSearchQuery && sortedPosts.length === 0 && !error && (
        <Card className="text-center py-16 px-8 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-sm px-4 py-2">
                Thử từ khóa ngắn hơn
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                Kiểm tra chính tả
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                Thử danh mục khác
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !debouncedSearchQuery && (
        <Card className="text-center py-20 px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-primary-200 dark:border-gray-700">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform rotate-6">
              <SearchIcon className="h-16 w-16 text-white transform -rotate-6" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bắt đầu tìm kiếm của bạn
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-8">
              Nhập từ khóa vào ô tìm kiếm phía trên để khám phá hàng ngàn bài viết chất lượng
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-primary-100 dark:border-gray-600">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Theo tiêu đề</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tìm bài viết qua tên</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-secondary-100 dark:border-gray-600">
                <div className="text-2xl mb-2">🏷️</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Theo thẻ</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lọc theo chủ đề</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-accent-100 dark:border-gray-600">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Theo nội dung</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tìm trong bài viết</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}