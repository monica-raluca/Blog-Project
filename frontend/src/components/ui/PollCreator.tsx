import React, { useState } from 'react';
import { CreatePollRequest } from '../../types/pollTypes';
import { PollStorage } from '../../utils/pollStorage';
import { useAuth } from '../../api/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X, BarChart3, Calendar, Settings } from 'lucide-react';

interface PollCreatorProps {
  contentType: 'article' | 'comment';
  contentId: string;
  onPollCreated?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PollCreator: React.FC<PollCreatorProps> = ({
  contentType,
  contentId,
  onPollCreated,
  onCancel,
  className = ''
}) => {
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length < 10) { // Limit to 10 options
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) { // Minimum 2 options
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = (): string | null => {
    if (!question.trim()) {
      return 'Poll question is required';
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      return 'At least 2 options are required';
    }

    // Check for duplicate options
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      return 'Poll options must be unique';
    }

    if (expiresAt) {
      const expiry = new Date(expiresAt);
      if (expiry <= new Date()) {
        return 'Expiry date must be in the future';
      }
    }

    return null;
  };

  const handleCreatePoll = async () => {
    if (!currentUser) {
      setError('You must be logged in to create a poll');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const validOptions = options.filter(opt => opt.trim().length > 0);
      
      const request: CreatePollRequest = {
        question: question.trim(),
        options: validOptions.map(opt => opt.trim()),
        allowMultipleVotes,
        expiresAt: expiresAt || undefined,
        contentType,
        contentId
      };

      PollStorage.createPoll(request, currentUser);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setAllowMultipleVotes(false);
      setExpiresAt('');
      
      onPollCreated?.();
    } catch (err) {
      setError('Failed to create poll. Please try again.');
      console.error('Error creating poll:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!currentUser) {
    return (
      <Card className={`p-4 bg-yellow-50 border-yellow-200 ${className}`}>
        <p className="text-sm text-yellow-700 text-center">
          Please log in to create polls
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Create Poll</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Poll Question */}
        <div>
          <Label htmlFor="poll-question" className="text-sm font-medium text-gray-700">
            Poll Question
          </Label>
          <Input
            id="poll-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="mt-1"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {question.length}/200 characters
          </p>
        </div>

        {/* Poll Options */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Poll Options
          </Label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          )}
        </div>

        {/* Poll Settings */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <Label className="text-sm font-medium text-gray-700">Poll Settings</Label>
          </div>
          
          {/* Multiple Votes */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="multiple-votes"
              checked={allowMultipleVotes}
              onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="multiple-votes" className="text-sm text-gray-700">
              Allow multiple votes per user
            </Label>
          </div>

          {/* Expiry Date */}
          <div>
            <Label htmlFor="expiry-date" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Expiry Date (Optional)
            </Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={getMinDate()}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for polls that never expire
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCreatePoll}
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PollCreator;