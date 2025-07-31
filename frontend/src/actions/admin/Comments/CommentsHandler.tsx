import { Comment } from "../../../api/types";
import { useNavigate } from "react-router";
import { deleteComment } from "../../../api/CommentApi";

export function useCommentHandlers(
    onEdit?: (comment: Comment) => void,
    onView?: (comment: Comment) => void,
    token?: string,
    loadComments?: () => void
) {
    const navigate = useNavigate();

    const handleEdit = (comment: Comment): void => {
        if (onEdit) {
            onEdit(comment);
        } else {
            navigate(`/admin/comments/${comment.id}/edit`);
        }
    };

    const handleView = (comment: Comment): void => {
        if (onView) {
            onView(comment);
        } else {
            navigate(`/admin/comments/${comment.id}`);
        }
    };

    const handleDelete = async (comment: Comment): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this comment?') || !token) return;

        try {
            await deleteComment(comment.articleId, comment.id!, token);
            if (loadComments) {
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
        handleEdit,
        handleView,
        handleDelete
    };
}