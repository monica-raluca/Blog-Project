package com.cognizant.practice.blog.article.controller;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.service.ArticlesService;
import io.micrometer.common.util.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class ArticlesController {

    private final ArticlesService articlesService;

    public ArticlesController(ArticlesService articlesService) {
        this.articlesService = articlesService;
    }

    // GET /articles -> list of articles in memory = List<Articles> => json array
    @GetMapping(value="/articles")
    public List<Article> printArticles(@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "0") int from,
                                       @RequestParam(required = false) String title, @RequestParam(required = false) String author,
                                       @RequestParam(required = false) LocalDateTime createdDate,
                                       @RequestParam(defaultValue = "createdDate desc") String sort) {

        return articlesService.getArticlesParams(size, from, title, author, createdDate, sort);
    }
    // GET /articles/<id> -> just the id'th article = Article => single json
        // id not found => error 404 http
        // id not found => throw exception not found
    @GetMapping(value="/articles/{id}")
    public Article printArticleById(@PathVariable UUID id) {
        return articlesService.getArticleById(id);
    }

    // DELETE /articles/<id> -> delete article from list = void
        // id not found => error
    @DeleteMapping(value="/articles/{id}")
    public void deleteArticle(@PathVariable UUID id) {
        articlesService.deleteArticle(id);
    }
    // Article record -> POJO plain old java object
        // fields: id, title, content, createdDate -> LocalDateTime, updatedData -> LocalDateTime
    // DTO -> data transfer object
    // list of articles List<Article>
    // OR Map<id, Article>

    // postman, curl, bruno

    // is valid method
    public boolean isValidParam(String param) {
        return !StringUtils.isEmpty(param);
    }

    public boolean isValidRequest(ArticleRequest request) {
        return isValidParam(request.title()) && isValidParam(request.content());
    }

    // CREATE POST /articles with json
    // payload / request body -> title, content
    // new Article -> title, content from object + id
    // id + 1
    // UUID -> unique, uses timestamp
    // change localdatetime -> .now()
    // postMapping createArticle(@requestbody articlerequest art)...
    // return created article
    @PostMapping(value="/articles")
    public Article createArticle(@RequestBody ArticleRequest articleRequest, Principal principal) {
        return articlesService.createArticle(articleRequest, principal);
    }
    // validation
    // if title empty -> error 400 bad request

    // UPDATE PUT /articles/<id>
    // title, content ->ArticleRequest
    // update fields from request
    // updatedDate -> current date
    // return updated article
    @PutMapping(value = "/articles/{id}")
    public Article updateArticle(@PathVariable UUID id, @RequestBody ArticleRequest articleRequest, Principal principal) {
        return articlesService.updateArticle(id, articleRequest, principal);
    }

    @PostMapping(value="/articles/{id}/upload-image")
    public Article uploadImage(@RequestParam("file") MultipartFile file, @PathVariable UUID id, Principal principal) {
        return articlesService.uploadImage(file, id, principal);
    }

    @PostMapping(value="/articles/{id}/upload-media")
    public Article uploadMedia(@RequestParam("file") MultipartFile file, @PathVariable UUID id, Principal principal) {
        return articlesService.uploadMedia(file, id, principal);
    }
}
