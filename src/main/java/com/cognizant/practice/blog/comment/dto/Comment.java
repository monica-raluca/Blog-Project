package com.cognizant.practice.blog.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
    private UUID id;

    private String content;
    private LocalDateTime dateCreated;
}
