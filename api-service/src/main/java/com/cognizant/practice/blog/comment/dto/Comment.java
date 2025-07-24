package com.cognizant.practice.blog.comment.dto;

import com.cognizant.practice.blog.user.dto.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Comment {
    private UUID id;

    private String content;
    private LocalDateTime dateCreated;
    private LocalDateTime dateEdited;

    private User author;
    private User editor;
}
