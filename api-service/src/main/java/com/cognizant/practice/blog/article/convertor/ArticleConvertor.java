package com.cognizant.practice.blog.article.convertor;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.user.convertor.UserConvertor;

public class ArticleConvertor {
    public static Article toDto(ArticleEntity articleEntity) {
        return Article.builder()
                .id(articleEntity.getId())
                .title(articleEntity.getTitle())
                .content(articleEntity.getContent())
                .summary(articleEntity.getSummary())
                .createdDate(articleEntity.getCreatedDate())
                .updatedDate(articleEntity.getUpdatedDate())
                .imageUrl(articleEntity.getImageUrl())
                .author(UserConvertor.toDto(articleEntity.getAuthor()))
                .editor(UserConvertor.toDto(articleEntity.getEditor()))
                .build();
    }

    public static ArticleEntity toEntity(Article article) {
        return ArticleEntity.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .summary(article.getSummary())
                .createdDate(article.getCreatedDate())
                .updatedDate(article.getUpdatedDate())
                .imageUrl(article.getImageUrl())
                .author(UserConvertor.toEntity(article.getAuthor()))
                .editor(UserConvertor.toEntity(article.getEditor()))
                .build();
    }
}
