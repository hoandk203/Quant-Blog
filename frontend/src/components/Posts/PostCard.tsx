import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Eye, Heart, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  post: {
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
  };
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/posts/${post.slug}`}>
      <Card className="group flex flex-col bg-white dark:bg-gray-800 justify-between hover:shadow-xl hover:-translate-y-1 hover:border-primary-300 dark:hover:border-primary-700 h-full transition-all duration-200 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {post.featuredImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary-600 text-white border-0 shadow-lg">
                {post.category.name}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold line-clamp-2 mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
            {post.title}
          </h3>

          <p className="text-base text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed flex-1">
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/30 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} phút</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.publishedAt)}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
} 