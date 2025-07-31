import { Comment } from "../../../api/types";
import { useNavigate } from "react-router";
import { deleteComment, editComment, fetchCommentById } from "../../../api/CommentApi";

export function useCommentHandlers(
    onEdit?: (comment: Comment) => void,
    onView?: (comment: Comment) => void,
    token?: string | null,
    loadComments?: () => void
) {
    const navigate = useNavigate();

    const handleCommentEdit = async (comment: Comment): Promise<void> => {
        if (onEdit) {
            onEdit(comment);
        } else {
            navigate(`/admin/comments/${comment.id}/edit`);
        }
    };

    const handleCommentView = (comment: Comment): void => {
        if (onView) {
            onView(comment);
        } else {
            navigate(`/admin/comments/${comment.id}`);
        }
    };

    const handleCommentDelete = async (comment: Comment): Promise<void> => {
        console.log('handleCommentDelete');
        
        if (!window.confirm('Are you sure you want to delete this comment?') || !token) return;

        try {
            await deleteComment(comment.article?.id!, comment.id!, token);
            if (loadComments) {
                console.log('loadComments');
                loadComments();
            }
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        }
    };

    return {
        handleCommentEdit,
        handleCommentView,
        handleCommentDelete
    };
}