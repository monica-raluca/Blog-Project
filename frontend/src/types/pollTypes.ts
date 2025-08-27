// Poll types for client-side only implementation
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Array of user IDs who voted for this option
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string; // User ID
  createdAt: string;
  expiresAt?: string; // Optional expiration date
  allowMultipleVotes: boolean;
  isActive: boolean;
  // For tracking which content this poll belongs to
  contentType: 'article' | 'comment';
  contentId: string; // Article ID or Comment ID
}

export interface PollVote {
  pollId: string;
  optionId: string;
  userId: string;
  timestamp: string;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allowMultipleVotes: boolean;
  expiresAt?: string;
  contentType: 'article' | 'comment';
  contentId: string;
}

export interface PollResults {
  totalVotes: number;
  options: {
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }[];
}