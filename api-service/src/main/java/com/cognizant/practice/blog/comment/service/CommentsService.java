package com.cognizant.practice.blog.comment.service;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.comment.convertor.CommentConvertor;
import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.dto.CommentRequest;
import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import com.cognizant.practice.blog.comment.repository.CommentsRepository;
import com.cognizant.practice.blog.user.convertor.UserConvertor;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;
import com.cognizant.practice.blog.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentsService {
    public CommentsRepository commentsRepository;
    public ArticleRepository articleRepository;
    public UserRepository userRepository;

    public CommentsService(CommentsRepository commentsRepository, ArticleRepository articleRepository, UserRepository userRepository) {
        this.commentsRepository = commentsRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    // public UserEntity getPrincipalUser(Principal author) {
    //     String username = author.getName();

    //     Optional<UserEntity> user = userRepository.findByUsername(username);
    //     if (user.isEmpty()) {
    //         throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    //     }

    //     return user.get();
    // }

    public UserEntity getUserFromUsername(String username) {
        Optional<UserEntity> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return user.get();
    }

    public UserEntity getPrincipalUser(Principal author) {
        String username = author.getName();

        return getUserFromUsername(username);
    }

    public boolean isValidRequest(CommentRequest request) {
        return request.content() != null && !request.content().isEmpty();
    }

    public List<Comment> getCommentsByArticleId(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        return article.get().getComments().stream().map(CommentConvertor::toDto).collect(Collectors.toList());
    }

    public Comment createComment(UUID id, CommentRequest commentRequest, Principal user) {
        if (!isValidRequest(commentRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        Optional<ArticleEntity> article = articleRepository.findById(id);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        UserEntity author = getPrincipalUser(user);
        CommentEntity newComment = new CommentEntity(null, commentRequest.content(), LocalDateTime.now(), LocalDateTime.now(), article.get(), author, author);

        return CommentConvertor.toDto(commentsRepository.save(newComment));
    }

    public Comment editComment(UUID articleId, UUID commentId, CommentRequest commentRequest, Principal user) {
        if (!isValidRequest(commentRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }
        UserEntity editor = getPrincipalUser(user);
        
        Optional<ArticleEntity> article = articleRepository.findById(articleId);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        Optional<CommentEntity> comment = commentsRepository.findById(commentId);
        if (comment.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");

        
        CommentEntity targetComment = comment.get();

        targetComment.setContent(commentRequest.content());
        targetComment.setDateEdited(LocalDateTime.now());
        targetComment.setEditor(editor);

        return CommentConvertor.toDto(commentsRepository.save(targetComment));
    }

    public void deleteComment(UUID articleId, UUID commentId, Principal user) {
        Optional<ArticleEntity> article = articleRepository.findById(articleId);
        if (article.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");

        Optional<CommentEntity> comment = commentsRepository.findById(commentId);
        if (comment.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");

        commentsRepository.delete(comment.get());
    }
}
