package com.cognizant.practice.blog.article.service;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import org.junit.jupiter.api.Test;
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
    void shouldDeleteArticle() {
        UUID uuid = UUID.randomUUID();

        articlesService.deleteArticle(uuid);

        verify(mockArticleRepository).deleteById(uuid);
    }

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

        Optional<Article> result = articlesService.getArticleById(uuid);

        assertEquals(uuid, result.get().getId());
    }

    @Test
    void shouldCreateArticle() {
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
    void shouldUpdateArticle() {
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
}