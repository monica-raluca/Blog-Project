package com.cognizant.practice.blog.article.dto;

import com.cognizant.practice.blog.user.dto.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
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

    private String imageUrl;
    private List<String> mediaUrls;
    
    // Crop metadata for cover image display
    private Double cropX;        // X position of crop area (0-1)
    private Double cropY;        // Y position of crop area (0-1) 
    private Double cropWidth;    // Width of crop area (0-1)
    private Double cropHeight;   // Height of crop area (0-1)
    private Double cropScale;    // Scale factor for the image

    private User author;
    private User editor;
}
