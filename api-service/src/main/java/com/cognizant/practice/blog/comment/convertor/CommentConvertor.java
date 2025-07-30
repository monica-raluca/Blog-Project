package com.cognizant.practice.blog.comment.convertor;

import com.cognizant.practice.blog.article.convertor.ArticleConvertor;
import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.user.convertor.UserConvertor;

public class CommentConvertor {
    public static Comment toDto(CommentEntity commentEntity) {
        return Comment.builder()
                .id(commentEntity.getId())
                .content(commentEntity.getContent())
                .dateCreated(commentEntity.getDateCreated())
                .dateEdited(commentEntity.getDateEdited())
                .article(ArticleConvertor.toDto(commentEntity.getArticleEntity()))
                .author(UserConvertor.toDto(commentEntity.getAuthor()))
                .editor(UserConvertor.toDto(commentEntity.getEditor()))
                .build();
    }

    public static CommentEntity toEntity(Comment comment) {
        return CommentEntity.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .dateCreated(comment.getDateCreated())
                .dateEdited(comment.getDateEdited())
                .articleEntity(ArticleConvertor.toEntity(comment.getArticle()))
                .author(UserConvertor.toEntity(comment.getAuthor()))
                .editor(UserConvertor.toEntity(comment.getEditor()))
                .build();
    }
}
