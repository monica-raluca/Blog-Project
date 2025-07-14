package com.cognizant.practice.blog.article.repository;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.user.dto.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<ArticleEntity, UUID> {
    List<ArticleEntity> findAllByTitle(String title);
    List<ArticleEntity> findAllByAuthor(User user);
}
