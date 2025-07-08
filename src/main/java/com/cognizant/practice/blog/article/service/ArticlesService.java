package com.cognizant.practice.blog.article.service;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArticlesService {
    public ArticleRepository articleRepository;

    public List<Article> articlesList = new ArrayList<>();

    public ArticlesService(ArticleRepository articlesRepository) {
        this.articleRepository = articlesRepository;
    }

    public List<Article> getAllArticles() {
        List<ArticleEntity> entities = articleRepository.findAll();

        return entities.stream().map(articleEntity -> new Article(
                articleEntity.getId(),
                articleEntity.getTitle(),
                articleEntity.getContent(),
                articleEntity.getCreatedDate(),
                articleEntity.getUpdatedDate()
        )).collect(Collectors.toList());
    }

    public Article getArticleById(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        return article.map(articleEntity -> new Article(
                articleEntity.getId(),
                articleEntity.getTitle(),
                articleEntity.getContent(),
                articleEntity.getCreatedDate(),
                articleEntity.getUpdatedDate()
        )).get();
    }

    public void deleteArticle(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);

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
        if (!isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        ArticleEntity newArticle = new ArticleEntity(null, articleRequest.title(), articleRequest.content(), LocalDateTime.now(), LocalDateTime.now(), null);
        articleRepository.save(newArticle);

        return new Article(newArticle.getId(), newArticle.getTitle(), newArticle.getContent(), newArticle.getCreatedDate(), newArticle.getUpdatedDate());
    }

    public Article updateArticle(UUID id, ArticleRequest articleRequest) {
        if (!isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Optional<ArticleEntity> article = articleRepository.findById(id);
        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        ArticleEntity newArticle = article.get();

        newArticle.setContent(articleRequest.content());
        newArticle.setTitle(articleRequest.title());
        newArticle.setUpdatedDate(LocalDateTime.now());

        articleRepository.save(newArticle);
        return new Article(newArticle.getId(), newArticle.getTitle(), newArticle.getContent(), newArticle.getCreatedDate(), newArticle.getUpdatedDate());
    }

}
