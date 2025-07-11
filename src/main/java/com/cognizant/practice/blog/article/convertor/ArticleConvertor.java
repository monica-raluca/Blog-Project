package com.cognizant.practice.blog.article.convertor;

import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.entity.ArticleEntity;

public class ArticleConvertor {
    public static Article toDto(ArticleEntity articleEntity) {
        return Article.builder()
                .id(articleEntity.getId())
                .title(articleEntity.getTitle())
                .content(articleEntity.getContent())
                .createdDate(articleEntity.getCreatedDate())
                .updatedDate(articleEntity.getUpdatedDate())
                .build();
    }
}
