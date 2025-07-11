package com.cognizant.practice.blog.comment.convertor;

import com.cognizant.practice.blog.comment.dto.Comment;
import com.cognizant.practice.blog.comment.entity.CommentEntity;

public class CommentConvertor {
    public static Comment toDto(CommentEntity commentEntity) {
        return Comment.builder()
                .id(commentEntity.getId())
                .content(commentEntity.getContent())
                .dateCreated(commentEntity.getDateCreated())
                .build();
    }
}
