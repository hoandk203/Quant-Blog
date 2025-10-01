'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Calendar, User } from 'lucide-react';
import { Question } from '../../types/qa.types';
import VoteButton from './VoteButton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toVietnamTime } from '../../lib/timezone';

interface QuestionCardProps {
  question: Question;
  onVoteUpdate?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onVoteUpdate }) => {
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Chuyển từ UTC+0 sang UTC+7 (giờ Việt Nam)
  const timeAgo = formatDistanceToNow(toVietnamTime(question.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex gap-5">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButton
            targetId={question.id}
            targetType="question"
            upvoteCount={question.upvote_count}
            downvoteCount={question.downvote_count}
            userVoteStatus={question.userVoteStatus}
            onVoteUpdate={onVoteUpdate}
            size="md"
          />
        </div>

        {/* Stats Section */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[90px] bg-gradient-to-br from-accent-50 to-cyan-50 dark:from-accent-900/20 dark:to-cyan-900/20 rounded-xl p-3 border-2 border-accent-200 dark:border-accent-800 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            <span className="font-bold text-lg text-accent-700 dark:text-accent-300">{question.answer_count ?? 0}</span>
          </div>
          <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wide">Trả lời</span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/community/${question.id}`}
            className="block group"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:via-secondary-600 group-hover:to-secondary-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-3 leading-tight">
              {question.title}
            </h3>
          </Link>

          <div
            className="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: truncateContent(question.content.replace(/<[^>]*>/g, ''), 180)
            }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <User className="w-4 h-4" />
                <span className="font-semibold">{question.user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{timeAgo}</span>
              </div>
            </div>

            {/* Tags or Categories could go here */}
            <div className="flex gap-2">
              {/* Placeholder for tags */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard; 