package com.cognizant.practice.blog.service;

import com.cognizant.practice.blog.model.Article;
import com.cognizant.practice.blog.model.ArticleRequest;
import com.cognizant.practice.blog.repository.ArticleRepository;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ArticlesService {
    public ArticleRepository articleRepository;

    public List<Article> articlesList = new ArrayList<>();

    public ArticlesService(ArticleRepository articlesRepository) {
        this.articleRepository = articlesRepository;
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article getArticleById(UUID id) {
        Optional<Article> article = articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        return article.get();
    }

    public void deleteArticle(UUID id) {
        Optional<Article> article = articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        articleRepository.deleteById(id);
    }

    public boolean isValidParam(String param) {
        return !StringUtils.isEmpty(param);
    }

    public boolean isValidRequest(ArticleRequest request) {
        return isValidParam(request.title()) && isValidParam(request.content());
    }

    public Article createArticle(ArticleRequest articleRequest) {
        if (isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Article newArticle = new Article(null, articleRequest.title(), articleRequest.content(), LocalDateTime.now(), LocalDateTime.now());
        return articleRepository.save(newArticle);
    }

    public Article updateArticle(UUID id, ArticleRequest articleRequest) {
        if (isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Optional<Article> article = articleRepository.findById(id);
        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        Article newArticle = article.get();

        newArticle.setContent(articleRequest.content());
        newArticle.setTitle(articleRequest.title());
        newArticle.setUpdatedDate(LocalDateTime.now());

        return articleRepository.save(newArticle);
    }

}
