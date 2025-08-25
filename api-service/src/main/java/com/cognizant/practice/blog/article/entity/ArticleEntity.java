package com.cognizant.practice.blog.article.entity;

import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;
import jakarta.persistence.*;
import jdk.jfr.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ARTICLES")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    private String imageUrl;
    private List<String> mediaUrls;
    
    @OneToMany(mappedBy = "articleEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentEntity> comments;

    @ManyToOne
    private UserEntity author;

    @ManyToOne
    private UserEntity editor;
}
