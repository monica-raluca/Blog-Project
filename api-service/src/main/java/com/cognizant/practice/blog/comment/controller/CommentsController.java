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

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class CommentsController {
    private final CommentsService commentsService;

    public CommentsController(CommentsService commentsService) {
        this.commentsService = commentsService;
    }

    @GetMapping(value="/comments")
    public List<Comment> getAllComments() {
        return commentsService.getAllComments();
    }

    @GetMapping(value="/articles/{id}/comments")
    public List<Comment> getCommentsByArticleID(@PathVariable UUID id) {
        return commentsService.getCommentsByArticleId(id);
    }

    @PostMapping(value="/articles/{id}/comments")
    public Comment createComment(@PathVariable UUID id, @RequestBody CommentRequest commentRequest, Principal user) {
        return commentsService.createComment(id, commentRequest, user);
    }

    @PutMapping(value="/articles/{articleId}/comments/{commentId}")
    public Comment editComment(@PathVariable UUID articleId, @PathVariable UUID commentId, @RequestBody CommentRequest commentRequest, Principal user) {
        return commentsService.editComment(articleId, commentId, commentRequest, user);
    }

    @DeleteMapping(value="/articles/{articleId}/comments/{commentId}")
    public void deleteComment(@PathVariable UUID articleId, @PathVariable UUID commentId, Principal user) {
        commentsService.deleteComment(articleId, commentId, user);
    }
}
