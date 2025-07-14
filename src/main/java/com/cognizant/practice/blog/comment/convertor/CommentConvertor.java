package com.cognizant.practice.blog.comment.convertor;

import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.user.convertor.UserConvertor;

public class CommentConvertor {
    public static Comment toDto(CommentEntity commentEntity) {
        return Comment.builder()
                .id(commentEntity.getId())
                .content(commentEntity.getContent())
                .dateCreated(commentEntity.getDateCreated())
                .author(UserConvertor.toDto(commentEntity.getAuthor()))
                .build();
    }
}
