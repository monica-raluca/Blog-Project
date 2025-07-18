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
                .author(UserConvertor.toDto(articleEntity.getAuthor()))
                .build();
    }
}
