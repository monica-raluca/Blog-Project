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
                .mediaUrls(articleEntity.getMediaUrls())
                .category(articleEntity.getCategory())
                .cropX(articleEntity.getCropX())
                .cropY(articleEntity.getCropY())
                .cropWidth(articleEntity.getCropWidth())
                .cropHeight(articleEntity.getCropHeight())
                .cropScale(articleEntity.getCropScale())
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
                .mediaUrls(article.getMediaUrls())
                .category(article.getCategory())
                .cropX(article.getCropX())
                .cropY(article.getCropY())
                .cropWidth(article.getCropWidth())
                .cropHeight(article.getCropHeight())
                .cropScale(article.getCropScale())
                .author(UserConvertor.toEntity(article.getAuthor()))
                .editor(UserConvertor.toEntity(article.getEditor()))
                .build();
    }
}
