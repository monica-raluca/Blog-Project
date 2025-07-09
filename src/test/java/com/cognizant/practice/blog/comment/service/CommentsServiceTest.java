package com.cognizant.practice.blog.comment.service;

import com.cognizant.practice.blog.article.repository.ArticleRepository;
import com.cognizant.practice.blog.comment.repository.CommentsRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommentsServiceTest {
    CommentsRepository mockCommentsRepository = mock(CommentsRepository.class);
    ArticleRepository mockArticleRepository = mock(ArticleRepository.class);
}