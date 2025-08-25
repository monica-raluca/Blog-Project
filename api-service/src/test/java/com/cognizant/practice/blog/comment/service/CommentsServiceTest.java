//package com.cognizant.practice.blog.comment.service;
//
//import com.cognizant.practice.blog.article.dto.Article;
//import com.cognizant.practice.blog.article.dto.ArticleRequest;
//import com.cognizant.practice.blog.article.entity.ArticleEntity;
//import com.cognizant.practice.blog.article.repository.ArticleRepository;
//import com.cognizant.practice.blog.comment.dto.Comment;
//import com.cognizant.practice.blog.comment.dto.CommentRequest;
//import com.cognizant.practice.blog.comment.entity.CommentEntity;
//import com.cognizant.practice.blog.comment.repository.CommentsRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.server.ResponseStatusException;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class CommentsServiceTest {
//    CommentsRepository mockCommentsRepository = mock(CommentsRepository.class);
//    ArticleRepository mockArticleRepository = mock(ArticleRepository.class);
//    CommentsService commentsService = new CommentsService(mockCommentsRepository, mockArticleRepository);
//
//    @Test
//    void shouldGetCommentByArticleId() {
//        UUID uuid = UUID.randomUUID();
//        List<CommentEntity> comments = List.of(new CommentEntity(null, "content1", LocalDateTime.now(), null), new CommentEntity(null, "content2", LocalDateTime.now(), null));
//        ArticleEntity articleEntity = new ArticleEntity();
//        articleEntity.setId(uuid);
//        articleEntity.setComments(comments);
//
//        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.of(articleEntity));
//
//        List<Comment> result = commentsService.getCommentsByArticleId(uuid);
//
//        assertEquals(comments.size(), result.size());
//        assertEquals("content1", result.getFirst().getContent());
//    }
//
//    @Test
//    void shouldThrowExceptionGetWhenArticleNotFound() {
//        UUID uuid = UUID.randomUUID();
//
//        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.empty());
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> commentsService.getCommentsByArticleId(uuid));
//
//        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldCreateCommentWhenValidRequest() {
//        UUID uuid = UUID.randomUUID();
//        ArticleEntity articleEntity = new ArticleEntity();
//        articleEntity.setId(uuid);
//        CommentRequest commentRequest = new CommentRequest("content");
//        CommentEntity commentEntity = new CommentEntity(null, commentRequest.content(), LocalDateTime.now(), articleEntity);
//
//        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.of(articleEntity));
//        when(mockCommentsRepository.save(any(CommentEntity.class))).thenReturn(commentEntity);
//
//        Comment result = commentsService.createComment(uuid, commentRequest);
//
//        assertEquals(commentRequest.content(), result.getContent());
//        verify(mockCommentsRepository).save(any(CommentEntity.class));
//    }
//
//    @Test
//    void shouldThrowExceptionCreateWhenInvalidRequest() {
//        CommentRequest commentRequest = new CommentRequest(null);
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> commentsService.createComment(UUID.randomUUID(), commentRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateWhenArticleNotFound() {
//        CommentRequest commentRequest = new CommentRequest("content");
//        UUID uuid = UUID.randomUUID();
//
//        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.empty());
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> commentsService.createComment(uuid, commentRequest));
//
//        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
//    }
//}