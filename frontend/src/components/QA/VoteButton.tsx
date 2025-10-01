'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { VoteType } from '../../types/qa.types';
// import { toast } from 'react-hot-toast';
import { voteQuestion, voteAnswer } from '../../services/QAService';
import {toast} from "react-toastify";

interface VoteButtonProps {
  targetId: string;
  targetType: 'question' | 'answer';
  upvoteCount: number;
  downvoteCount: number;
  userVoteStatus?: VoteType | null;
  onVoteUpdate?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const VoteButton: React.FC<VoteButtonProps> = ({
  targetId,
  targetType,
  upvoteCount,
  downvoteCount,
  userVoteStatus,
  onVoteUpdate,
  size = 'md',
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvoteCount);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvoteCount);
  const [currentVoteStatus, setCurrentVoteStatus] = useState(userVoteStatus);

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleVote = async (voteType: VoteType) => {
    try {
      setIsVoting(true);

      if (targetType === 'question') {
        const res= await voteQuestion(targetId, voteType);
      } else {
        await voteAnswer(targetId, voteType);
      }

      // Update local state based on vote logic
      if (currentVoteStatus === voteType) {
        // Remove vote
        setCurrentVoteStatus(null);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => Math.max(0, prev - 1));
        } else {
          setCurrentDownvotes(prev => Math.max(0, prev - 1));
        }
      } else if (currentVoteStatus && currentVoteStatus !== voteType) {
        // Change vote
        setCurrentVoteStatus(voteType);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => prev + 1);
          setCurrentDownvotes(prev => Math.max(0, prev - 1));
        } else {
          setCurrentDownvotes(prev => prev + 1);
          setCurrentUpvotes(prev => Math.max(0, prev - 1));
        }
      } else {
        // New vote
        setCurrentVoteStatus(voteType);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => prev + 1);
        } else {
          setCurrentDownvotes(prev => prev + 1);
        }
      }

      onVoteUpdate?.();
    } catch (error) {
      if(error == 'Error: No refresh token available'){
        toast.error('Bạn cần đăng nhập để thực hiện hành động này!');
        return;
      }
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const netVotes = currentUpvotes - currentDownvotes;

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote(VoteType.UPVOTE)}
        disabled={isVoting}
        className={`
          ${sizeClasses[size]} rounded-lg border-2 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md
          ${currentVoteStatus === VoteType.UPVOTE
            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 scale-110'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
        `}
        title="Upvote"
      >
        <ChevronUp className={iconSizeClasses[size]} />
      </button>

      {/* Vote Count */}
      <div className={`
        font-bold ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg'} px-2 py-1 rounded-lg
        ${netVotes > 0 ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20' : netVotes < 0 ? 'text-secondary-700 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-900/20' : 'text-gray-600 dark:text-gray-400'}
      `}>
        {netVotes > 0 ? `+${netVotes}` : netVotes}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote(VoteType.DOWNVOTE)}
        disabled={isVoting}
        className={`
          ${sizeClasses[size]} rounded-lg border-2 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md
          ${currentVoteStatus === VoteType.DOWNVOTE
            ? 'bg-secondary-100 dark:bg-secondary-900/30 border-secondary-400 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-900/50 scale-110'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 hover:border-secondary-300 dark:hover:border-secondary-600 hover:text-secondary-600 dark:hover:text-secondary-400'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
        `}
        title="Downvote"
      >
        <ChevronDown className={iconSizeClasses[size]} />
      </button>
    </div>
  );
};

export default VoteButton; 