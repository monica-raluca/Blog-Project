import React, { useState } from 'react';
import { Comments, CommentForm, CommentItem } from './Comments';
import { Comment } from '../../api/types';

const CommentsDemo: React.FC = () => {
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    const handleCommentView = (comment: Comment): void => {
        setSelectedComment(comment);
        setShowForm(false);
        setEditingComment(null);
    };

    const handleCommentEdit = (comment: Comment): void => {
        setEditingComment(comment);
        setShowForm(true);
        setSelectedComment(null);
    };

    const handleFormSubmit = (comment: Comment): void => {
        setShowForm(false);
        setEditingComment(null);
        setSelectedComment(null);
        // Optionally refresh the comments list
    };

    const handleFormCancel = (): void => {
        setShowForm(false);
        setEditingComment(null);
    };

    const handleBackToList = (): void => {
        setSelectedComment(null);
        setShowForm(false);
        setEditingComment(null);
    };

    if (showForm) {
        return (
            <div>
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handleBackToList}>← Back to Comments List</button>
                </div>
                <CommentForm
                    isEdit={!!editingComment}
                    initialComment={editingComment || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    if (selectedComment) {
        return (
            <div>
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handleBackToList}>← Back to Comments List</button>
                </div>
                <CommentItem
                    comment={selectedComment}
                    variant="detailed"
                    onEdit={() => handleCommentEdit(selectedComment)}
                    onDelete={handleBackToList}
                />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h1>Comments Admin Demo</h1>
                <p>This demo shows the Comments admin components in action:</p>
                <ul>
                    <li><strong>Filter by Article:</strong> Use the dropdown to filter comments by specific articles</li>
                    <li><strong>View Comments:</strong> Click "View" to see detailed comment information</li>
                    <li><strong>Edit Comments:</strong> Click "Edit" to modify comment content</li>
                    <li><strong>Delete Comments:</strong> Click "Delete" to remove comments (with confirmation)</li>
                    <li><strong>Pagination:</strong> Navigate through pages of comments</li>
                </ul>
                <button 
                    onClick={() => setShowForm(true)}
                    style={{ 
                        marginTop: '10px', 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px' 
                    }}
                >
                    Create New Comment
                </button>
            </div>
            
            <Comments
                onView={handleCommentView}
                onEdit={handleCommentEdit}
            />
        </div>
    );
};

export default CommentsDemo; 