package com.cognizant.practice.blog.article.controller;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.service.ArticlesService;
import org.checkerframework.checker.units.qual.A;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArticlesControllerTest {
    @Test
    void shouldGetAllArticles() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);

        List<Article> articles = List.of(new Article(UUID.randomUUID(), "title1", "content1", LocalDateTime.now(), LocalDateTime.now()),
                                         new Article(UUID.randomUUID(), "title2", "content2", LocalDateTime.now(), LocalDateTime.now()));

        when(mockArticleService.getAllArticles()).thenReturn(articles);

        List<Article> result = articlesController.printArticles();

        assertEquals(articles.size(), result.size());
        assertEquals("title1", result.getFirst().getTitle());
    }

    @Test
    void shouldGetArticleById() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);
        UUID uuid = UUID.randomUUID();
        Article article = new Article();
        article.setId(uuid);

        when(mockArticleService.getArticleById(uuid)).thenReturn(article);

        Article newArticle = articlesController.printArticleById(uuid);

        assertEquals(uuid, newArticle.getId());
    }

    @Test
    void shouldDeleteArticle() {
        ArticlesService mockArticlesService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticlesService);
        UUID id = UUID.randomUUID();

        articlesController.deleteArticle(id);

        verify(mockArticlesService).deleteArticle(id);
    }

    @Test
    void shouldCreateArticle() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);

        ArticleRequest articleRequest = new ArticleRequest("title", "content");
        UUID uuid = UUID.randomUUID();
        Article article = new Article();
        article.setId(uuid);
        article.setTitle(articleRequest.title());
        article.setContent(articleRequest.content());
        when(mockArticleService.createArticle(articleRequest)).thenReturn(article);

        Article result = articlesController.createArticle(articleRequest);

        assertEquals(article, result);
    }


    @Test
    void shouldUpdateArticle() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);
        ArticleRequest articleRequest = new ArticleRequest("title", "content");

        UUID id = UUID.randomUUID();
        Article article = new Article();
        article.setId(id);
        article.setTitle(articleRequest.title());
        article.setContent(articleRequest.content());

        when(mockArticleService.updateArticle(id, articleRequest)).thenReturn(article);

        Article result = articlesController.updateArticle(id, articleRequest);

        assertEquals(article, result);
    }

}