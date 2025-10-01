import React, { useState, useRef, useLayoutEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toVietnamTime } from "../../lib/timezone";
import { ThumbsUp, Reply, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "../../lib/utils";
import { Comment } from "./PostComment";
import { useSelector } from "react-redux";
import { RootState } from "frontend/src/store";
import Link from "next/link";

// Di chuyển CommentItem ra ngoài để tránh re-creation
interface CommentItemProps {
    comment: Comment;
    level?: number; // Thêm level để track độ sâu
    replyTo: string | null;
    replyContent: string;
    submitting: boolean;
    isAuthenticated: boolean;
    onReplyToggle: (commentId: string) => void;
    onReplyContentChange: (content: string) => void;
    onSubmitReply: (parentId: string) => void;
    onCancelReply: () => void;
    isLastInLevel?: boolean;
  }
  
  const CommentItem: React.FC<CommentItemProps> = React.memo(function CommentItem({
    comment, 
    level = 0,
    replyTo,
    replyContent,
    submitting,
    isAuthenticated,
    onReplyToggle,
    onReplyContentChange,
    onSubmitReply,
    onCancelReply,
    isLastInLevel = false
  })  {
    const [showReplies, setShowReplies] = useState(false);
    const [commentHeight, setCommentHeight] = useState(0);
    const [childrenHeight, setChildrenHeight] = useState(0);
    const commentRef = useRef<HTMLDivElement>(null);
    const childrenRef = useRef<HTMLDivElement>(null);
    const {user} = useSelector((state: RootState) => state.auth);
    const isReply = level > 0;
    const canReply = level < 2; // Chỉ cho phép reply đến level 2 (tổng cộp 3 cấp)

    // Tính toán chiều cao thực tế
    useLayoutEffect(() => {
      if (commentRef.current) {
        setCommentHeight(commentRef.current.offsetHeight);
      }
      if (childrenRef.current) {
        setChildrenHeight(childrenRef.current.scrollHeight);
      }
    }, [showReplies, replyTo, comment.children?.length, comment.content]);

    // Tính toán vị trí avatar center
    const avatarSize = level === 0 ? 40 : level === 1 ? 36 : 32;
    const avatarCenter = avatarSize / 2;
    const marginLeft = level * 24;
    const verticalLineLeft = -30 + (level - 1) * 24; // Điều chỉnh vị trí theo level

    return (
      <div 
        ref={commentRef}
        className={cn(
          "relative",
          level === 0 ? "mb-4" : "mb-2"
        )}
      >

        {/* Đường ngang kết nối - hiển thị cho tất cả level > 0 */}
        {level > 0 && (
          <div 
            className="absolute h-0.5 bg-gray-300 dark:bg-gray-600 z-10"
            style={{
              left: -31,
              top: avatarCenter + 2,
              width: 55,
            }}
          >
            <div 
              className="absolute bg-gray-300 dark:bg-gray-600"
              style={{
                left: 0,
                top: -3,
                width: '6px',
                height: '6px',
                borderTopRightRadius: '6px',
                borderBottomRightRadius: '6px',
              }}
            />
          </div>
        )}

        <div 
          className="flex gap-3 items-start"
          style={{ marginLeft }}
        >
          {/* Avatar với đường nhánh xuất phát cho children */}
          <div className="relative">
            <Link href={`/profile/${comment.author.id}`}>
              <Avatar className={cn(
                "relative z-20 bg-white dark:bg-gray-800 ring-2 transition-all hover:ring-4",
                level === 0 ? "w-10 h-10 ring-primary-200 dark:ring-primary-800 hover:ring-primary-400" :
                level === 1 ? "w-9 h-9 ring-secondary-200 dark:ring-secondary-800 hover:ring-secondary-400" :
                "w-8 h-8 ring-accent-200 dark:ring-accent-800 hover:ring-accent-400",
                level > 0 && "border-2 border-white dark:border-gray-800"
              )}>
                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold">
                  {comment.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Đường dọc xuất phát từ avatar này xuống children */}
            {comment.children && comment.children.length > 0 && (level === 0 ? showReplies : true) && (
              <div 
                className="absolute w-0.5 bg-gray-300 dark:bg-gray-600 z-10"
                style={{
                  left: avatarCenter - 1,
                  top: avatarSize + 4,
                  height: childrenHeight > 0 ? commentHeight - 136 : 200,
                }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment Bubble */}
            <div className="inline-block max-w-full break-words bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl px-5 py-4 mb-2 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600">
              <div className="font-bold text-sm mb-2 text-gray-900 dark:text-gray-100">
                <Link href={`/profile/${comment.author.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {comment.author.name}
                </Link>
              </div>

              <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                {comment.content}
              </div>

              {comment.imageUrl && (
                <div className="mt-3">
                  <img
                    src={comment.imageUrl}
                    alt="Comment attachment"
                    className="max-w-full max-h-48 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 ml-3 mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(toVietnamTime(comment.createdAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Thích
              </Button>

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReplyToggle(comment.id)}
                  disabled={!isAuthenticated}
                  className="h-auto px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-all disabled:opacity-50"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Trả lời
                </Button>
              )}

              {comment.likeCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {comment.likeCount}
                  </span>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {canReply && replyTo === comment.id && (
              <div className="ml-3 mb-4 bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl p-4 border-2 border-secondary-200 dark:border-gray-700 shadow-md animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-3 items-start">
                  <Avatar className="w-10 h-10 ring-2 ring-secondary-200 dark:ring-secondary-800 ring-offset-2">
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
                      placeholder="Viết câu trả lời của bạn..."
                      value={replyContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onReplyContentChange(e.target.value)}
                      className="resize-none rounded-xl bg-white dark:bg-gray-700 border-2 border-secondary-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-secondary-500 dark:focus:ring-secondary-400 focus:border-secondary-500 min-h-[80px] transition-all"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancelReply}
                        className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-4"
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onSubmitReply(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="text-sm font-bold bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 text-white rounded-lg px-6 shadow-lg hover:shadow-xl transition-all"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Đang gửi
                          </>
                        ) : (
                          <>
                            <Reply className="w-4 h-4 mr-1" />
                            Gửi trả lời
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Replies Button */}
            {level === 0 && comment.children && comment.children.length > 0 && (
              <div className="ml-3 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-auto px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1.5" />
                      Ẩn {comment.children.length} phản hồi
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1.5" />
                      Xem {comment.children.length} phản hồi
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Replies */}
            {comment.children && comment.children.length > 0 && (
              <div 
                ref={childrenRef}
                className={cn(
                  "relative transition-all duration-300",
                  level === 0 ? (showReplies ? "max-h-none opacity-100" : "max-h-0 opacity-0") : "max-h-none opacity-100"
                )}
              >
                {comment.children.map((reply, index) => (
                  <CommentItem 
                    key={reply.id}
                    comment={reply} 
                    level={level + 1} // Tăng level
                    replyTo={replyTo}
                    replyContent={replyContent}
                    submitting={submitting}
                    isAuthenticated={isAuthenticated}
                    onReplyToggle={onReplyToggle}
                    onReplyContentChange={onReplyContentChange}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    isLastInLevel={index === comment.children!.length - 1} // Xác định item cuối cùng
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
  
  export default CommentItem;