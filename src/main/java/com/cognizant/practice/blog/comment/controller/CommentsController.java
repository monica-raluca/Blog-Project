package com.cognizant.practice.blog.comment.controller;

import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.dto.CommentRequest;
import com.cognizant.practice.blog.comment.service.CommentsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CommentsController {
    private final CommentsService commentsService;

    public CommentsController(CommentsService commentsService) {
        this.commentsService = commentsService;
    }

    @GetMapping(value="/articles/{id}/comments")
    public List<Comment> getCommentsByArticleID(@PathVariable UUID id) {
        return commentsService.getCommentsByArticleId(id);
    }

    @PostMapping(value="/articles/{id}/comments")
    public Comment createComment(@PathVariable UUID id, @RequestBody CommentRequest commentRequest) {
        return commentsService.createComment(id, commentRequest);
    }
}
