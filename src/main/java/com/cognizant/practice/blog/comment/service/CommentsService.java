package com.cognizant.practice.blog.comment.service;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.dto.CommentRequest;
import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import com.cognizant.practice.blog.comment.repository.CommentsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentsService {
    public CommentsRepository commentsRepository;
    public ArticleRepository articleRepository;

    public CommentsService(CommentsRepository commentsRepository, ArticleRepository articleRepository) {
        this.commentsRepository = commentsRepository;
        this.articleRepository = articleRepository;
    }

    public List<Comment> getCommentsByArticleId(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        return article.get().getComments().stream().map(commentEntity -> new Comment(
                commentEntity.getId(),
                commentEntity.getContent(),
                commentEntity.getDateCreated()
        )).collect(Collectors.toList());
    }

    public boolean isValidRequest(CommentRequest request) {
        return request.content() != null && !request.content().isEmpty();
    }

    public Comment createComment(UUID id, CommentRequest commentRequest) {
        if (!isValidRequest(commentRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Optional<ArticleEntity> article = articleRepository.findById(id);

        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }
//
//        CommentEntity newComment = new CommentEntity(null, commentRequest.content(), LocalDateTime.now(), article.map(articleEntity -> new ArticleEntity(
//                articleEntity.getId(),
//                articleEntity.getTitle(),
//                articleEntity.getContent(),
//                articleEntity.getCreatedDate(),
//                articleEntity.getUpdatedDate(),
//                articleEntity.getComments()
//        )).get());

        CommentEntity newComment = new CommentEntity(null, commentRequest.content(), LocalDateTime.now(), article.get());
        commentsRepository.save(newComment);

        return new Comment(newComment.getId(), newComment.getContent(), newComment.getDateCreated());
    }
}
