package com.cognizant.practice.blog.article.controller;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.service.ArticlesService;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ArticlesControllerTest {

    @Test
    void shouldReturnArticleById() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);
        UUID uuid = UUID.randomUUID();
        Article article = new Article();
        article.setId(uuid);
        when(mockArticleService.getArticleById(uuid)).thenReturn(Optional.of(article));

        Article newArticle = articlesController.printArticleById(uuid);

        assertEquals(uuid, newArticle.getId());
    }

    @Test
    void shouldThrowExceptionArticleNotFound() {
        ArticlesService mockArticleService = mock(ArticlesService.class);
        ArticlesController articlesController = new ArticlesController(mockArticleService);
        UUID uuid = UUID.randomUUID();
        when(mockArticleService.getArticleById(uuid)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> articlesController.printArticleById(uuid));
    }
}