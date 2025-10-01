'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ImageIcon, Send, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import instanceApi from '../../lib/axios';
import { clientCookies } from '../../services/TokenService';
import CommentItem from './CommentItem';
import { readFile } from 'frontend/src/lib/utils';
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { cn } from "../../lib/utils";
import { useSelector } from 'react-redux';
import { RootState } from 'frontend/src/store';
import { notificationService } from 'frontend/src/services/NotificationService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Comment {
  id: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  children?: Comment[];
}

interface PostCommentProps {
  postId: string;
}


export default function PostComment({ postId }: PostCommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {user} = useSelector((state: RootState) => state.auth);

  // Check authentication
  useEffect(() => {
    const tokens = clientCookies.getAuthTokens();
    setIsAuthenticated(!!tokens?.accessToken);
  }, []);

  // Fetch comments
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/comments/post/${postId}?page=${page}&limit=10`);
      
      if (page === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }
      
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const base64File= await readFile(event.target.files[0])
      setSelectedImage(base64File)
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để bình luận');
      return;
    }

    try {
      setSubmitting(true);

      const commentData = {
        content: newComment,
        postId,
        imageUrl: selectedImage || undefined
      };

      const response = await instanceApi.post('/comments', commentData);

      // Add new comment to top of list
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setSelectedImage('');
      setError(null);

      if(response.data.post.authorId !== user?.id) {
        try {
          await notificationService.createNotification({
            type: 'post_commented',
            title: 'Bình luận mới',
            message: `bình luận về bài viết "${response.data.post.title.substring(0, 25)}..." của bạn.`,
            recipientId: response.data.post.authorId || '',
            actorId: user?.id || '',
            postId: postId || '',
            metadata: {
              postTitle: response.data.post.title || '',
              postSlug: response.data.post.slug || '',
              actionUrl: `/posts/${response.data.post.slug}`
            }
          })
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      if (err.response?.status === 401) {
        alert('Bạn cần đăng nhập để bình luận');
      } else {
        setError('Không thể gửi bình luận');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) {
      alert('Bạn cần đăng nhập để trả lời');
      return;
    }

    try {
      setSubmitting(true);

      const replyData = {
        content: replyContent,
        postId,
        parentId
      };

      const response = await instanceApi.post('/comments', replyData);
      if(response.data.post.authorId !== user?.id) {
        try {
          await notificationService.createNotification({
            type: 'comment_replied',
            title: 'Trả lời bình luận',
            message: `trả lời bình luận của bạn tại bài viết "${response.data.post.title.substring(0, 25)}..."`,
            recipientId: response.data.post.authorId || '',
            actorId: user?.id || '',
            postId: postId || '',
            metadata: {
              postTitle: response.data.post.title || '',
              postSlug: response.data.post.slug || '',
              actionUrl: `/posts/${response.data.post.slug}`
            }
          })
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
      // Helper function để update nested comments
      const updateCommentsWithReply = (comments: Comment[], targetParentId: string, newReply: Comment): Comment[] => {
        return comments.map(comment => {
          if (comment.id === targetParentId) {
            // Tìm thấy parent comment, thêm reply
            return { 
              ...comment, 
              children: [...(comment.children || []), newReply],
              replyCount: comment.replyCount + 1
            };
          } else if (comment.children && comment.children.length > 0) {
            // Tìm trong children
            const updatedChildren = updateCommentsWithReply(comment.children, targetParentId, newReply);
            return {
              ...comment,
              children: updatedChildren
            };
          }
          return comment;
        });
      };

      // Update comments với reply mới
      setComments(prev => updateCommentsWithReply(prev, parentId, response.data));

      setReplyContent('');
      setReplyTo(null);
      setError(null);
    } catch (err: any) {
      console.error('Error submitting reply:', err);
      setError('Không thể gửi trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  // Sử dụng useCallback để tránh re-creation của handlers
  const handleReplyToggle = useCallback((commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    setReplyContent('');
  }, [replyTo]);

  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  const handleSubmitReply = useCallback((parentId: string) => {
    submitReply(parentId);
  }, [replyContent, isAuthenticated, postId]);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
    setReplyContent('');
  }, []);

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Bình luận
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-lg">
          ({comments.reduce((total, comment) => total + 1 + (comment.children?.length || 0), 0)})
        </span>
      </h3>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="mb-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl p-6 border-2 border-primary-200 dark:border-gray-700 shadow-lg">
          <div className="flex gap-4 items-start">
            <Avatar className="w-12 h-12 ring-2 ring-primary-200 dark:ring-primary-800 ring-offset-2">
              {user?.avatar ? (
                <AvatarImage src={user?.avatar} alt={user?.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Chia sẻ suy nghĩ của bạn..."
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                className="resize-none rounded-xl bg-white dark:bg-gray-700 border-2 border-primary-200 dark:border-gray-600 text-base focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 min-h-[100px] transition-all"
                rows={3}
              />

              {selectedImage && (
                <div className="mt-3 ml-2">
                  <div className="relative inline-block">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-auto h-24 rounded-xl object-cover"
                    />
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="absolute top-1 right-1 w-6 h-6 p-0 rounded-full bg-black/70 hover:bg-black/80 text-white border-none"
                      onClick={(e) => setSelectedImage('')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageSelect}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="ghost"
                      className="cursor-pointer bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 rounded-xl p-3 text-primary-600 dark:text-primary-400 transition-all"
                      asChild
                    >
                      <span>
                        <ImageIcon className="w-5 h-5" />
                      </span>
                    </Button>
                  </label>
                </div>

                <Button
                  onClick={submitComment}
                  disabled={submitting || !newComment.trim()}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Đăng bình luận
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Bạn cần đăng nhập để bình luận.
          </AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              level={0} // Level 0 cho top-level comments
              replyTo={replyTo}
              replyContent={replyContent}
              submitting={submitting}
              isAuthenticated={isAuthenticated}
              onReplyToggle={handleReplyToggle}
              onReplyContentChange={handleReplyContentChange}
              onSubmitReply={handleSubmitReply}
              onCancelReply={handleCancelReply}
            />
          ))}

          {/* Load More Button */}
          {page < totalPages && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xem thêm bình luận'}
              </Button>
            </div>
          )}

          {comments.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}