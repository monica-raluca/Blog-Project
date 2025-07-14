package com.cognizant.practice.blog.article.repository;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity, UUID> {
    Page<ArticleEntity> findAllByTitle(String title, Pageable pageable);
    Page<ArticleEntity> findAllByAuthor(UserEntity user, Pageable pageable);
    Page<ArticleEntity> findAllByTitleAndAuthor(String title, UserEntity user, Pageable pageable);
}
