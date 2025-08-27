import { Poll, PollVote, PollOption, CreatePollRequest, PollResults } from '../types/pollTypes';

const POLLS_STORAGE_KEY = 'blog_polls';
const VOTES_STORAGE_KEY = 'blog_poll_votes';

// Generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Storage utilities
export class PollStorage {
  // Get all polls from localStorage
  static getAllPolls(): Poll[] {
    try {
      const stored = localStorage.getItem(POLLS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading polls from localStorage:', error);
      return [];
    }
  }

  // Save polls to localStorage
  static savePolls(polls: Poll[]): void {
    try {
      localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(polls));
    } catch (error) {
      console.error('Error saving polls to localStorage:', error);
    }
  }

  // Get all votes from localStorage
  static getAllVotes(): PollVote[] {
    try {
      const stored = localStorage.getItem(VOTES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading votes from localStorage:', error);
      return [];
    }
  }

  // Save votes to localStorage
  static saveVotes(votes: PollVote[]): void {
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
    } catch (error) {
      console.error('Error saving votes to localStorage:', error);
    }
  }

  // Create a new poll
  static createPoll(request: CreatePollRequest, userId: string): Poll {
    const pollId = generateId();
    const options: PollOption[] = request.options.map(optionText => ({
      id: generateId(),
      text: optionText,
      votes: 0,
      voters: []
    }));

    const poll: Poll = {
      id: pollId,
      question: request.question,
      options,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      expiresAt: request.expiresAt,
      allowMultipleVotes: request.allowMultipleVotes,
      isActive: true,
      contentType: request.contentType,
      contentId: request.contentId
    };

    const polls = this.getAllPolls();
    polls.push(poll);
    this.savePolls(polls);

    return poll;
  }

  // Get polls for specific content
  static getPollsForContent(contentType: 'article' | 'comment', contentId: string): Poll[] {
    const polls = this.getAllPolls();
    return polls.filter(poll => 
      poll.contentType === contentType && 
      poll.contentId === contentId &&
      poll.isActive
    );
  }

  // Get a specific poll by ID
  static getPollById(pollId: string): Poll | null {
    const polls = this.getAllPolls();
    return polls.find(poll => poll.id === pollId) || null;
  }

  // Vote on a poll
  static voteOnPoll(pollId: string, optionId: string, userId: string): boolean {
    const polls = this.getAllPolls();
    const votes = this.getAllVotes();
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.isActive) return false;

    // Check if poll has expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return false;
    }

    // Check if user has already voted
    const existingVotes = votes.filter(vote => vote.pollId === pollId && vote.userId === userId);
    
    if (!poll.allowMultipleVotes && existingVotes.length > 0) {
      return false; // User has already voted and multiple votes not allowed
    }

    // Check if user already voted for this specific option
    const existingVoteForOption = existingVotes.find(vote => vote.optionId === optionId);
    if (existingVoteForOption) {
      return false; // User already voted for this option
    }

    // Find the option and update vote count
    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) return false;

    // Add the vote
    const newVote: PollVote = {
      pollId,
      optionId,
      userId,
      timestamp: new Date().toISOString()
    };

    votes.push(newVote);
    option.votes += 1;
    option.voters.push(userId);

    // Save updated data
    this.savePolls(polls);
    this.saveVotes(votes);

    return true;
  }

  // Remove a vote
  static removeVote(pollId: string, optionId: string, userId: string): boolean {
    const polls = this.getAllPolls();
    const votes = this.getAllVotes();
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return false;

    const voteIndex = votes.findIndex(vote => 
      vote.pollId === pollId && 
      vote.optionId === optionId && 
      vote.userId === userId
    );

    if (voteIndex === -1) return false;

    // Remove the vote
    votes.splice(voteIndex, 1);

    // Update option vote count
    const option = poll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes = Math.max(0, option.votes - 1);
      const voterIndex = option.voters.indexOf(userId);
      if (voterIndex > -1) {
        option.voters.splice(voterIndex, 1);
      }
    }

    // Save updated data
    this.savePolls(polls);
    this.saveVotes(votes);

    return true;
  }

  // Get poll results
  static getPollResults(pollId: string): PollResults | null {
    const poll = this.getPollById(pollId);
    if (!poll) return null;

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    return {
      totalVotes,
      options: poll.options.map(option => ({
        id: option.id,
        text: option.text,
        votes: option.votes,
        percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
      }))
    };
  }

  // Check if user has voted in a poll
  static hasUserVoted(pollId: string, userId: string): boolean {
    const votes = this.getAllVotes();
    return votes.some(vote => vote.pollId === pollId && vote.userId === userId);
  }

  // Get user's votes in a poll
  static getUserVotes(pollId: string, userId: string): string[] {
    const votes = this.getAllVotes();
    return votes
      .filter(vote => vote.pollId === pollId && vote.userId === userId)
      .map(vote => vote.optionId);
  }

  // Delete a poll (set as inactive)
  static deletePoll(pollId: string, userId: string): boolean {
    const polls = this.getAllPolls();
    const poll = polls.find(p => p.id === pollId);
    
    if (!poll || poll.createdBy !== userId) return false;

    poll.isActive = false;
    this.savePolls(polls);
    return true;
  }

  // Clear all poll data (for testing/reset purposes)
  static clearAllData(): void {
    localStorage.removeItem(POLLS_STORAGE_KEY);
    localStorage.removeItem(VOTES_STORAGE_KEY);
  }
}