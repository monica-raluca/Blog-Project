//package com.cognizant.practice.blog.comment.controller;
//
//import com.cognizant.practice.blog.comment.dto.Comment;
//import com.cognizant.practice.blog.comment.dto.CommentRequest;
//import com.cognizant.practice.blog.comment.entity.CommentEntity;
//import com.cognizant.practice.blog.comment.service.CommentsService;
//import org.junit.jupiter.api.Test;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class CommentsControllerTest {
//    CommentsService mockCommentsService = mock(CommentsService.class);
//    CommentsController commentsController = new CommentsController(mockCommentsService);
//
//    @Test
//    void shouldGetCommentsByArticleId() {
//        UUID uuid = UUID.randomUUID();
//        List<Comment> comments = List.of(new Comment(null, "content1", LocalDateTime.now()), new Comment(null, "content2", LocalDateTime.now()));
//
//        when(mockCommentsService.getCommentsByArticleId(uuid)).thenReturn(comments);
//
//        List<Comment> result = commentsController.getCommentsByArticleID(uuid);
//
//        assertEquals(comments.size(), result.size());
//        assertEquals("content1", result.getFirst().getContent());
//    }
//
//    @Test
//    void shouldCreateComment() {
//        UUID uuid = UUID.randomUUID();
//        CommentRequest commentRequest = new CommentRequest("content");
//        Comment comment = new Comment();
//        comment.setContent(commentRequest.content());
//
//        when(mockCommentsService.createComment(uuid, commentRequest)).thenReturn(comment);
//
//        Comment result = commentsController.createComment(uuid, commentRequest);
//
//        assertEquals("content", result.getContent());
//    }
//
//}