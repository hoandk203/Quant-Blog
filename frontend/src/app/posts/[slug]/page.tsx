'use client';

import React, { useState, useEffect } from 'react';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import { formatDate, calculateReadingTime } from '../../../lib/utils';
import axios from 'axios';
import { clientCookies } from '../../../services/TokenService';
import PostComment from '../../../components/Posts/PostComment';
import { getLikeStatus, getPostBySlug, getSaveStatus, toggleLikePost, toggleSavePost, trackViewPost } from 'frontend/src/services/PostService';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import Link from 'next/link';
import { notificationService } from '../../../services/NotificationService';
import { useSelector } from 'react-redux';
import { RootState } from 'frontend/src/store';
import { useTableOfContents, useActiveHeading, generateHeadingId } from '../../../hooks/useTableOfContents';
import TableOfContents from '../../../components/Posts/TableOfContents';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Global variable to store base64 images for current render
let currentBase64Images: Array<{ id: string; src: string; alt: string }> = [];

// Function to display proper language names
const getLanguageDisplayName = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    'cpp': 'C++',
    'mql5': 'MQL5',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'html': 'HTML',
    'css': 'CSS',
    'bash': 'Bash',
    'json': 'JSON',
    'php': 'PHP',
    'java': 'Java',
    'sql': 'SQL'
  };
  
  return languageMap[language.toLowerCase()] || language.toUpperCase();
};

// Function to process content and extract base64 images for separate handling
const processContentWithImages = (content: string) => {
  currentBase64Images = []; // Reset for each render
  
  // Find all base64 images and replace with placeholders
  const base64ImageRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g;
  let processedContent = content;
  let match;
  let imageIndex = 0;
  
  while ((match = base64ImageRegex.exec(content)) !== null) {
    const imgTag = match[0];
    
    // Extract src and alt from the img tag
    const srcMatch = imgTag.match(/src="([^"]*)"/);
    const altMatch = imgTag.match(/alt="([^"]*)"/);
    
    if (srcMatch) {
      const imageId = `__IMAGE_PLACEHOLDER_${imageIndex}__`;
      currentBase64Images.push({
        id: imageId,
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : ''
      });
      
      // Keep as HTML img tag but with placeholder src
      processedContent = processedContent.replace(imgTag, `<img src="${imageId}" alt="${altMatch ? altMatch[1] : ''}" class="w-full h-auto rounded-lg" />`);
      imageIndex++;
    }
  }
  
  // Process empty paragraphs to preserve line breaks
  processedContent = processedContent
    .replace(/<p><\/p>/g, '<p>&nbsp;</p>') // Replace empty paragraphs with non-breaking space
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '<p>&nbsp;</p>') // Replace paragraphs with only br tags
    .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>'); // Replace paragraphs with only whitespace
  
  return { processedContent, base64Images: currentBase64Images };
};

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    id: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // Table of contents
  const { headings, nestedHeadings } = useTableOfContents(post?.content || '');
  const activeHeadingId = useActiveHeading(headings);

  // Check authentication status
  useEffect(() => {
    const tokens = clientCookies.getAuthTokens();
    setIsAuthenticated(!!tokens?.accessToken);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPost();           // 1. Load post data
      trackView();           // 2. Track view (anonymous)
      
      // 3. Only check like status if user is authenticated
      if (isAuthenticated) {
        checkLikeStatus();   // Check if user liked this post
        checkSavedPost();
      }
    }
  }, [slug, isAuthenticated]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPostBySlug(slug);
      
      setPost(response);
      setLikeCount(response.likeCount || 0);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Bài viết không tồn tại');
      } else {
        setError('Không thể tải bài viết');
      }
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await trackViewPost(slug);
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const checkLikeStatus = async () => {
    try {
      // Lấy token từ cookies
      const tokens = clientCookies.getAuthTokens();
      if (!tokens?.accessToken) {
        // Không có token = chưa đăng nhập = chưa like
        setLiked(false);
        return;
      }

      const response = await getLikeStatus(slug);

      if (response) {
        setLiked(response.liked);
        // Cập nhật like count từ server (đảm bảo sync)
        setLikeCount(response.likeCount);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ = chưa đăng nhập = chưa like
        setLiked(false);
      } else {
        console.error('Error checking like status:', err);
        setLiked(false); // Default to not liked on error
      }
    }
  };

  const handleLike = async () => {
    try {
      // Lấy token từ cookies
      const tokens = clientCookies.getAuthTokens();
      if (!tokens?.accessToken) {
        alert('Bạn cần đăng nhập để thích bài viết');
        return;
      }

      const response = await toggleLikePost(slug);

      if (response) {
        setLiked(response.liked);
        setLikeCount(response.likeCount);
        if(response.liked && post?.author.id !== user?.id){
          try {
            await notificationService.createNotification({
              type: 'post_liked',
              title: 'Thích bài viết',
              message: `thích bài viết "${post?.title.substring(0, 25)}..." của bạn.`,
              recipientId: post?.author.id || '',
              actorId: user?.id || '',
              postId: post?.id || '',
              metadata: {
                postTitle: post?.title || '',
                postSlug: post?.slug || '',
                actionUrl: `/posts/${post?.slug}`
              }
            })
          } catch (error) {
            console.error('Error creating notification:', error);
          }
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Bạn cần đăng nhập để thích bài viết');
      } else {
        console.error('Error liking post:', err);
        alert('Có lỗi xảy ra khi thích bài viết');
      }
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSavePost = async () => {
    try {
      const response = await toggleSavePost(slug);
      if(response.saved){
        toast.success('Đã lưu bài viết');
        setSaved(true);
      } else {
        toast.success('Đã bỏ lưu bài viết');
        setSaved(false);
      }
    } catch (err: any) {
      console.error('Error saving post:', err);
      if(!isAuthenticated){
        toast.error('Bạn cần đăng nhập để lưu bài viết');
      } else {
        toast.error('Không thể lưu bài viết');
      }
    }
  }

  const checkSavedPost = async () => {
    try {
      const response = await getSaveStatus(slug);
        setSaved(response.saved);
    } catch (error) {
      console.error('Error checking saved post:', error);
    }
    
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="w-full h-96 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {error || 'Bài viết không tồn tại'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
      {/* Featured Image */}
      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}

      {/* Category */}
      <Badge
        className="mb-4 bg-primary-600 text-white border-0 shadow-lg hover:bg-primary-700 transition-colors"
      >
        {post.category.name}
      </Badge>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 break-words leading-tight bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 dark:from-white dark:via-primary-200 dark:to-white bg-clip-text text-transparent">
        {post.title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 dark:text-gray-400 mb-8">
        <div className="flex items-center gap-2">
          <AccessTime className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium">
            {calculateReadingTime(post.content)} phút đọc
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Visibility className="h-5 w-5 text-secondary-600" />
          <span className="text-sm font-medium">
            {post.viewCount} lượt xem
          </span>
        </div>
        <span className="text-sm font-medium">
          {formatDate(post.publishedAt)}
        </span>
      </div>

      {/* Author Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-primary-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Link href={`/profile/${post.author.id}`}>
              <div className="flex items-center gap-4 group">
                <Avatar className="h-14 w-14 ring-2 ring-primary-200 dark:ring-primary-800 ring-offset-2 group-hover:ring-primary-400 transition-all">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white text-lg font-bold">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.author.name}
                  </h3>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSavePost}
              className="ml-auto hover:bg-primary-100 dark:hover:bg-primary-900/20"
              title={saved ? 'Bỏ lưu' : 'Lưu bài viết'}
            >
              {saved ? (
                <Bookmark className="h-6 w-6 text-primary-600" />
              ) : (
                <BookmarkBorder className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Table of Contents */}
      {headings.length > 0 && (
        <div className="lg:hidden mb-6">
          <TableOfContents 
            headings={headings}
            nestedHeadings={nestedHeadings}
            activeId={activeHeadingId}
            className="mb-6"
          />
        </div>
      )}

      {/* Content */}
      <Card className="mb-6 border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 md:p-10">
          <div className="prose max-w-none
            [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-gray-800 [&_p]:dark:text-gray-200
            [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:text-lg [&_ul]:marker:text-primary-600
            [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:text-lg [&_ol]:marker:text-primary-600
            [&_li]:mb-2 [&_li]:leading-relaxed [&_li]:text-gray-800 [&_li]:dark:text-gray-200
            [&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:ml-0
            [&_a]:text-primary-600 [&_a]:dark:text-primary-400 [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2 [&_a]:hover:text-primary-700 [&_a]:dark:hover:text-primary-300 [&_a]:transition-colors
            [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:dark:text-white
            [&_em]:italic [&_em]:text-gray-700 [&_em]:dark:text-gray-300
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary-600 [&_blockquote]:bg-primary-50 [&_blockquote]:dark:bg-primary-900/10 [&_blockquote]:pl-6 [&_blockquote]:py-4 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:dark:text-gray-300
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-base
            [&_th]:bg-primary-600 [&_th]:text-white [&_th]:font-bold [&_th]:p-3 [&_th]:text-left [&_th]:border [&_th]:border-primary-700
            [&_td]:p-3 [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:text-gray-800 [&_td]:dark:text-gray-200
            [&_tr:nth-child(even)]:bg-gray-50 [&_tr:nth-child(even)]:dark:bg-gray-800/50
            [&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-gray-300 [&_hr]:dark:border-gray-600
          ">
            <ReactMarkdown
            components={{
              // Handle TipTap pre elements with data-language
              pre({node, children, ...props}: any) {
                const element = node;
                const dataLanguage = element?.properties?.dataLanguage;
                
                if (dataLanguage) {
                  // This is a TipTap code block - extract text content from children
                  let codeContent = '';
                  
                  // Function to recursively extract text from nested elements
                  const extractText = (child: any): string => {
                    if (typeof child === 'string') return child;
                    if (child?.props?.children) {
                      if (Array.isArray(child.props.children)) {
                        return child.props.children.map(extractText).join('');
                      }
                      return extractText(child.props.children);
                    }
                    return '';
                  };
                  
                  // Extract text from React children
                  if (children) {
                    if (Array.isArray(children)) {
                      codeContent = children.map(extractText).join('');
                    } else {
                      codeContent = extractText(children);
                    }
                  }
                  
                  return (
                    <div className="my-6 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      {/* Language badge with copy button */}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {getLanguageDisplayName(dataLanguage)}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(codeContent)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      
                      <div className="bg-[#1e1e1e] dark:bg-[#0d1117]">
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={dataLanguage}
                          PreTag="div"
                          customStyle={{
                            margin: '0',
                            padding: '24px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            overflow: 'auto'
                          }}
                          showLineNumbers={true}
                          lineNumberStyle={{
                            color: '#6e7681',
                            fontSize: '12px',
                            paddingRight: '16px',
                            marginRight: '16px',
                            borderRight: '1px solid #30363d',
                            textAlign: 'right',
                            minWidth: '40px'
                          }}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  );
                }
                
                // Default pre behavior for markdown
                return <pre {...props}>{children}</pre>;
              },
              
              // Handle images (including base64 placeholders)
              img({node, src, alt, ...props}: any) {
                // Check if this is a base64 placeholder
                const imageData = currentBase64Images.find(img => img.id === src);
                
                if (imageData) {
                  return (
                    <img 
                      src={imageData.src} 
                      alt={imageData.alt} 
                      className="w-full h-auto rounded-lg my-4"
                      onError={(e) => {
                        console.error('Base64 Image failed to load:', e);
                      }}
                      onLoad={() => {
                      }}
                      {...props}
                    />
                  );
                }
                return (
                  <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-auto rounded-lg my-4"
                    {...props}
                  />
                );
              },

              h1({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 1);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 1, 0);
                return <h1 id={id} className="text-3xl font-bold mb-6 mt-8 text-gray-900 dark:text-white break-words scroll-mt-24" {...props}>{children}</h1>;
              },

              h2({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 2);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 2, 0);
                return <h2 id={id} className="text-2xl font-bold mb-5 mt-8 text-gray-900 dark:text-white break-words scroll-mt-24 border-b-2 border-primary-200 dark:border-primary-800 pb-2" {...props}>{children}</h2>;
              },

              h3({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 3);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 3, 0);
                return <h3 id={id} className="text-xl font-bold mb-4 mt-6 text-gray-900 dark:text-white break-words scroll-mt-24" {...props}>{children}</h3>;
              },

              h4({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 4);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 4, 0);
                return <h4 id={id} className="text-lg font-bold mb-4 mt-6 text-gray-900 dark:text-white break-words scroll-mt-24" {...props}>{children}</h4>;
              },

              h5({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 5);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 5, 0);
                return <h5 id={id} className="text-base font-bold mb-3 mt-5 text-gray-900 dark:text-white break-words scroll-mt-24" {...props}>{children}</h5>;
              },

              h6({node, children, ...props}: any) {
                const text = Array.isArray(children) ? children.join('') : String(children);
                const cleanText = text.trim();
                const headingIndex = headings.findIndex(h => h.text === cleanText && h.level === 6);
                const id = headingIndex >= 0 ? headings[headingIndex].id : generateHeadingId(cleanText, 6, 0);
                return <h6 id={id} className="text-base font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-200 break-words scroll-mt-24" {...props}>{children}</h6>;
              },

              // Handle paragraphs with proper whitespace preservation
              p({node, children, ...props}: any) {
                // Check if paragraph contains only non-breaking space (our empty line marker)
                const isEmptyLineMarker = children === '\u00a0' || 
                  (Array.isArray(children) && children.length === 1 && children[0] === '\u00a0');
                
                if (isEmptyLineMarker) {
                  return <div className="h-6" />; // Empty line spacer
                }
                
                return <p className="mb-4 leading-7 whitespace-pre-wrap" {...props}>{children}</p>;
              },

              // Handle line breaks
              br({node, ...props}: any) {
                return <br className="block h-4" {...props} />;
              },

              // Handle unordered lists
              ul({node, children, ...props}: any) {
                // Check if this is a task list
                const isTaskList = node?.properties?.dataType === 'taskList';
                
                if (isTaskList) {
                  return <ul data-type="taskList" {...props}>{children}</ul>;
                }
                
                return <ul {...props}>{children}</ul>;
              },

              // Handle ordered lists
              ol({node, children, ...props}: any) {
                return <ol {...props}>{children}</ol>;
              },

              // Handle list items
              li({node, children, ...props}: any) {
                // Check if this is a task list item
                const isTaskItem = node?.properties?.dataType === 'taskItem';
                const isChecked = node?.properties?.dataChecked === 'true' || node?.properties?.dataChecked === true;
                
                if (isTaskItem) {
                  return (
                    <li className="flex items-center gap-2 list-none" {...props}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        disabled 
                        className="rounded border-gray-300 mt-1 flex-shrink-0"
                      />
                      <span className={isChecked ? 'line-through text-gray-500' : ''}>{children}</span>
                    </li>
                  );
                }
                
                return <li {...props}>{children}</li>;
              },

              // Handle markdown code blocks
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="my-6 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {/* Language badge with copy button */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {getLanguageDisplayName(match[1])}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    
                    <div className="bg-[#1e1e1e] dark:bg-[#0d1117]">
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0',
                          padding: '24px',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '0',
                          overflow: 'auto'
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{
                          color: '#6e7681',
                          fontSize: '12px',
                          paddingRight: '16px',
                          marginRight: '16px',
                          borderRight: '1px solid #30363d',
                          textAlign: 'right',
                          minWidth: '40px'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <code 
                    className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-md font-mono text-sm border border-red-200 dark:border-red-800/50"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
            }}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[]}
                      >
                            {(() => {
                const { processedContent } = processContentWithImages(post.content);
                return processedContent;
              })()}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {post.tags.map((tag) => (
          <Badge
            key={tag.slug}
            className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/30 px-4 py-2 rounded-full text-sm transition-colors border-0"
          >
            #{tag.name}
          </Badge>
        ))}
      </div>

      {/* Actions Card */}
      <Card className="mb-8 sticky bottom-4 z-10 shadow-2xl border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant={liked ? 'default' : 'outline'}
                onClick={handleLike}
                className="flex items-center gap-2 px-6 py-3 font-semibold transition-all hover:scale-105"
              >
                {liked ? <ThumbUp className="h-5 w-5" /> : <ThumbUpOutlined className="h-5 w-5" />}
                <span className="hidden sm:inline">{likeCount} Thích</span>
                <span className="sm:hidden">{likeCount}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                title="Chia sẻ lên Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="text-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                title="Chia sẻ lên Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('linkedin')}
                className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                title="Chia sẻ lên LinkedIn"
              >
                <LinkedIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare('copy')}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Sao chép liên kết"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <PostComment postId={post.id} />
        </div>
        
        {/* Table of Contents - Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            {/* Show table of contents only if there are headings */}
            {headings.length > 0 && (
              <TableOfContents 
                headings={headings}
                nestedHeadings={nestedHeadings}
                activeId={activeHeadingId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}