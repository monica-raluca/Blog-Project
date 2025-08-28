package com.cognizant.practice.blog.article.dto;

import com.cognizant.practice.blog.article.entity.ArticleEntity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ArticleSpecification {

    public static Specification<ArticleEntity> hasTitle(String title) {
        return (root, query, cb) ->
//                title == null ? null : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        title == null ? null : cb.equal(cb.lower(root.get("title")), title.toLowerCase());
    }

    public static Specification<ArticleEntity> hasAuthor(String username) {
        return (root, query, cb) ->
                username == null ? null :
                        cb.equal(cb.lower(root.get("author").get("username")), username.toLowerCase());
    }

    public static Specification<ArticleEntity> createdAfter(LocalDateTime date) {
        return (root, query, cb) ->
                date == null ? null : cb.greaterThanOrEqualTo(root.get("createdDate"), date);
    }

    public static Specification<ArticleEntity> hasCategory(String category) {
        return (root, query, cb) ->
                category == null ? null : cb.equal(root.get("category"), category);
    }   
}