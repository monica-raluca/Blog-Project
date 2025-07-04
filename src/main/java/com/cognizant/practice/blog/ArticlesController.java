package com.cognizant.practice.blog;

import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

@RestController
public class ArticlesController {
    private List<Article> articlesList = new ArrayList<>();
//    private long currentId = 0;

    public ArticlesController() {
        articlesList = addArticles();
    }

    public List<Article> addArticles() {
        articlesList.add(new Article(UUID.randomUUID(), "First one", "First content", LocalDateTime.now(), null));
        articlesList.add(new Article(UUID.randomUUID(), "Second one", "Second content", LocalDateTime.now(), null));
        articlesList.add(new Article(UUID.randomUUID(), "Third one", "Third content", LocalDateTime.now(), null));
//        currentId = 4;

        return articlesList;
    }

    // GET /articles -> list of articles in memory = List<Articles> => json array
    @GetMapping(value="/articles")
    public List<Article> printArticles() {
        return articlesList;
    }
    // GET /articles/<id> -> just the id'th article = Article => single json
        // id not found => error 404 http
        // id not found => throw exception not found
    @GetMapping(value="/articles/{id}")
    public Article printArticleById(@PathVariable UUID id) {
        for(Article article : articlesList) {
//            if (article.id() == id)
            if(article.id().equals(id))
                return article;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
    }
    // DELETE /articles/<id> -> delete article from list = void
        // id not found => error
    @DeleteMapping(value="/articles/{id}")
    public void deleteArticle(@PathVariable UUID id) {
        if (!articlesList.removeIf(article -> article.id().equals(id))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }
    }
    // Article record -> POJO plain old java object
        // fields: id, title, content, createdDate -> LocalDateTime, updatedData -> LocalDateTime
    // DTO -> data transfer object
    // list of articles List<Article>
    // OR Map<id, Article>

    // postman, curl, bruno

    // is valid method
    public boolean isValidRequest(String string) {
        return !StringUtils.isEmpty(string);
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
    public Article createArticle(@RequestBody ArticleRequest articleRequest) {
        if (!isValidRequest(articleRequest.title()) || !isValidRequest(articleRequest.content())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Article newArticle = new Article(UUID.randomUUID(), articleRequest.title(), articleRequest.content(), LocalDateTime.now(), null);
        articlesList.add(newArticle);

        return newArticle;
    }
    // validation
    // if title empty -> error 400 bad request

    // UPDATE PUT /articles/<id>
    // title, content ->ArticleRequest
    // update fields from request
    // updatedDate -> current date
    // return updated article
    @PutMapping(value = "/articles/{id}")
    public Article updateArticle(@PathVariable UUID id, @RequestBody ArticleRequest articleRequest) {
        if (!isValidRequest(articleRequest.title()) || !isValidRequest(articleRequest.content())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Article toUpdate = null;
        for (int i = 0; i < articlesList.size(); i++) {
            Article currentArticle = articlesList.get(i);
            if (currentArticle.id().equals(id)) {
                toUpdate = new Article(currentArticle.id(), articleRequest.title(), articleRequest.content(), currentArticle.createdDate(), LocalDateTime.now());
                articlesList.set(i, toUpdate);
                return toUpdate;
            }
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
    }

    // PATCH partial update


}
