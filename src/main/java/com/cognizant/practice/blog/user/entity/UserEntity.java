package com.cognizant.practice.blog.user.entity;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.comment.entity.CommentEntity;
import com.cognizant.practice.blog.user.dto.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "USERS")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String lastName;
    private String firstName;
    private String username;
    private String email;
    private String password;

    private LocalDateTime createdDate;

    private Role role;

    private List<ArticleEntity> articles;

    private List<CommentEntity> comments;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }
}
