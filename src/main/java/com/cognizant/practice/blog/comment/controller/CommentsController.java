package com.cognizant.practice.blog.comment.controller;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.article.service.ArticlesService;
import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.dto.CommentRequest;
import com.cognizant.practice.blog.comment.service.CommentsService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class CommentsController {
    private final CommentsService commentsService;
    private final ArticlesService articlesService;

    public CommentsController(CommentsService commentsService, ArticlesService articlesService) {
        this.commentsService = commentsService;
        this.articlesService = articlesService;
    }

    @GetMapping(value="/articles/{id}/comments")
    public List<Comment> getCommentsByArticleID(@PathVariable UUID id) {
        Optional<Article> article = articlesService.getArticleById(id);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        return commentsService.getCommentsByArticleId(id);
    }

    public boolean isValidRequest(CommentRequest request) {
        return request.content() != null && !request.content().isEmpty();
    }

    @PostMapping(value="/articles/{id}/comments")
    public Comment createComment(@PathVariable UUID id, @RequestBody CommentRequest commentRequest) {
        if (!isValidRequest(commentRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Optional<Article> article = articlesService.getArticleById(id);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        return commentsService.createComment(id, commentRequest);
    }
}
