package com.cognizant.practice.blog.article.service;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArticlesServiceTest {
    ArticleRepository mockArticleRepository = mock(ArticleRepository.class);
    ArticlesService articlesService = new ArticlesService(mockArticleRepository);

    @Test
    void shouldGetAllArticles() {
        List<ArticleEntity> articles = List.of(new ArticleEntity(UUID.randomUUID(), "title1", "content1", LocalDateTime.now(), LocalDateTime.now(), null),
                new ArticleEntity(UUID.randomUUID(), "title2", "content2", LocalDateTime.now(), LocalDateTime.now(), null));

        when(mockArticleRepository.findAll()).thenReturn(articles);

        List<Article> result = articlesService.getAllArticles();

        assertEquals(articles.size(), result.size());
        assertEquals("title1", result.getFirst().getTitle());
    }

    @Test
    void shouldGetArticleById() {
        UUID uuid = UUID.randomUUID();
        ArticleEntity article = new ArticleEntity();
        article.setId(uuid);

        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.of(article));

        Article result = articlesService.getArticleById(uuid);

        assertEquals(uuid, result.getId());
    }

    @Test
    void shouldThrowExceptionWhenArticleNotFound() {
        UUID uuid = UUID.randomUUID();
        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.empty());

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> articlesService.getArticleById(uuid));

        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
    }

    @Test
    void shouldDeleteArticle() {
        UUID uuid = UUID.randomUUID();
        ArticleEntity article = new ArticleEntity();
        article.setId(uuid);

        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.of(article));

        articlesService.deleteArticle(uuid);

        verify(mockArticleRepository).findById(uuid);
        verify(mockArticleRepository).deleteById(uuid);
    }

    @Test
    void shouldThrowExceptionDeleteWhenArticleNotFound() {
        UUID uuid = UUID.randomUUID();
        ArticleEntity article = new ArticleEntity();
        article.setId(uuid);

        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.empty());

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> articlesService.deleteArticle(uuid));

        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
    }

    @Test
    void shouldCreateArticleWhenValidRequest() {
        ArticleRequest articleRequest = new ArticleRequest("title", "content");
        ArticleEntity articleEntity = new ArticleEntity();
        articleEntity.setTitle(articleRequest.title());
        articleEntity.setContent(articleRequest.content());

        when(mockArticleRepository.save(any(ArticleEntity.class))).thenReturn(articleEntity);

        Article result = articlesService.createArticle(articleRequest);

        assertEquals(articleRequest.title(), result.getTitle());
        assertEquals(articleRequest.content(), result.getContent());
        verify(mockArticleRepository).save(any(ArticleEntity.class));
    }

    @Test
    void shouldThrowExceptionCreateInvalidRequest() {
        ArticleRequest articleRequest = new ArticleRequest(null, "");

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> articlesService.createArticle(articleRequest));

        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
    }

    @Test
    void shouldUpdateArticleWhenValidRequest() {
        ArticleRequest articleRequest = new ArticleRequest("title", "content");
        ArticleEntity articleEntity = new ArticleEntity();
        UUID uuid = UUID.randomUUID();
        articleEntity.setId(uuid);
        articleEntity.setTitle(articleRequest.title());
        articleEntity.setContent(articleRequest.content());

        when(mockArticleRepository.findById(uuid)).thenReturn(Optional.of(articleEntity));
        when(mockArticleRepository.save(any(ArticleEntity.class))).thenReturn(articleEntity);

        Article result = articlesService.updateArticle(uuid, articleRequest);

        assertEquals(uuid, result.getId());
        assertEquals(articleRequest.title(), result.getTitle());
        assertEquals(articleRequest.content(), result.getContent());
        verify(mockArticleRepository).findById(uuid);
        verify(mockArticleRepository).save(any(ArticleEntity.class));
    }

    @Test
    void shouldThrowExceptionUpdateInvalidRequest() {
        ArticleRequest articleRequest = new ArticleRequest(null, "");

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> articlesService.updateArticle(UUID.randomUUID(), articleRequest));

        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
    }

    @Test
    void shouldThrowExceptionUpdateArticleNotFound() {
        ArticleRequest articleRequest = new ArticleRequest("title", "content");
        UUID id = UUID.randomUUID();

        when(mockArticleRepository.findById(id)).thenReturn(Optional.empty());

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> articlesService.updateArticle(id, articleRequest));

        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
    }
}