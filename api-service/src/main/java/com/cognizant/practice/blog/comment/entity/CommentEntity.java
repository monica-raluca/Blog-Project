package com.cognizant.practice.blog.comment.entity;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "COMMENTS")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(columnDefinition = "text")
    private String content;
    
    private LocalDateTime dateCreated;
    private LocalDateTime dateEdited;
    @ManyToOne
    private ArticleEntity articleEntity;

    @ManyToOne
    private UserEntity author;

    @ManyToOne
    private UserEntity editor;
}
