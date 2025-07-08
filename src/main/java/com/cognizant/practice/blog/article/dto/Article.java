package com.cognizant.practice.blog.article.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Article {
    private UUID id;

    private String title;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
