package com.cognizant.practice.blog.article.dto;

import com.cognizant.practice.blog.user.dto.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Article {
    private UUID id;

    private String title;
    private String content;
    private String summary;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    private User author;
    private User editor;
}
