import React, { useState, useEffect } from 'react';
import { Poll, PollResults } from '../../types/pollTypes';
import { PollStorage } from '../../utils/pollStorage';
import { useAuth } from '../../api/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, BarChart3, Users, Clock, Trash2 } from 'lucide-react';

interface PollComponentProps {
  poll: Poll;
  onPollUpdate?: () => void;
  showResults?: boolean;
  className?: string;
}

export const PollComponent: React.FC<PollComponentProps> = ({
  poll,
  onPollUpdate,
  showResults = false,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<PollResults | null>(null);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Load poll data on mount
  useEffect(() => {
    loadPollData();
  }, [poll.id, currentUser]);

  // Check if poll is expired
  useEffect(() => {
    if (poll.expiresAt) {
      setIsExpired(new Date(poll.expiresAt) < new Date());
    }
  }, [poll.expiresAt]);

  const loadPollData = () => {
    const pollResults = PollStorage.getPollResults(poll.id);
    setResults(pollResults);

    if (currentUser) {
      const votes = PollStorage.getUserVotes(poll.id, currentUser);
      setUserVotes(votes);
      setHasVoted(PollStorage.hasUserVoted(poll.id, currentUser));
    }
  };

  const handleVote = async (optionId: string) => {
    if (!currentUser || isVoting || isExpired) return;

    setIsVoting(true);

    // Check if user is trying to vote for an option they already voted for
    if (userVotes.includes(optionId)) {
      // Remove vote
      const success = PollStorage.removeVote(poll.id, optionId, currentUser);
      if (success) {
        loadPollData();
        onPollUpdate?.();
      }
    } else {
      // Add vote
      const success = PollStorage.voteOnPoll(poll.id, optionId, currentUser);
      if (success) {
        loadPollData();
        onPollUpdate?.();
      }
    }

    setIsVoting(false);
  };

  const handleDeletePoll = () => {
    if (!currentUser) return;
    
    const success = PollStorage.deletePoll(poll.id, currentUser);
    if (success) {
      onPollUpdate?.();
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const isUserOwner = currentUser === poll.createdBy;
  const showVotingInterface = !showResults && !isExpired && currentUser;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4 ${className}`}>
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Poll
            </Badge>
            {poll.allowMultipleVotes && (
              <Badge variant="outline" className="text-xs">
                Multiple votes allowed
              </Badge>
            )}
          </div>
          <h4 className="font-semibold text-gray-800 text-lg mb-2">
            {poll.question}
          </h4>
        </div>
        
        {isUserOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeletePoll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Poll Options */}
      <div className="space-y-2 mb-4">
        {poll.options.map((option) => {
          const isUserVote = userVotes.includes(option.id);
          const percentage = results ? 
            results.options.find(o => o.id === option.id)?.percentage || 0 : 0;

          return (
            <div key={option.id} className="relative">
              {/* Option Button/Display */}
              {showVotingInterface ? (
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={isVoting}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    isUserVote
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isUserVote ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="p-3 rounded-lg border bg-white border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {isUserVote && <CheckCircle className="w-5 h-5 text-blue-600" />}
                      <span className="font-medium">{option.text}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{results?.totalVotes || 0} total votes</span>
          </div>
          
          {poll.expiresAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className={isExpired ? 'text-red-600' : ''}>
                {formatTimeRemaining(poll.expiresAt)}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Created {new Date(poll.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Login prompt */}
      {!currentUser && !showResults && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-700">
            Please log in to participate in this poll
          </p>
        </div>
      )}
    </div>
  );
};

export default PollComponent;