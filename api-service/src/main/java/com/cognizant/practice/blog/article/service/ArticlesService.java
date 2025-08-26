package com.cognizant.practice.blog.article.service;

import com.cognizant.practice.blog.article.convertor.ArticleConvertor;
import com.cognizant.practice.blog.article.dto.Article;
import com.cognizant.practice.blog.article.dto.ArticleSpecification;
import com.cognizant.practice.blog.article.dto.SpecificationBuilder;
import com.cognizant.practice.blog.article.entity.ArticleEntity;
import com.cognizant.practice.blog.article.dto.ArticleRequest;
import com.cognizant.practice.blog.article.repository.ArticleRepository;
import com.cognizant.practice.blog.user.convertor.UserConvertor;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;
import com.cognizant.practice.blog.user.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArticlesService {
    public ArticleRepository articleRepository;
    public UserRepository userRepository;

    public List<Article> articlesList = new ArrayList<>();

    public ArticlesService(ArticleRepository articlesRepository, UserRepository userRepository) {
        this.articleRepository = articlesRepository;
        this.userRepository = userRepository;
    }

    public boolean isValidParam(String param) {
        return !StringUtils.isEmpty(param);
    }

    public boolean isValidRequest(ArticleRequest request) {
        return isValidParam(request.title()) && isValidParam(request.content());
    }

    public String summarize(String article) {
        int maxLength = 500;
        if (article.length() <= maxLength) {
            return article;
        }

        String truncated = article.substring(0, maxLength);

        int lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex == -1) {
            return truncated;
        }

        return truncated.substring(0, lastSpaceIndex);
    }

    public UserEntity getUserFromUsername(String username) {
        Optional<UserEntity> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return user.get();
    }

    public UserEntity getPrincipalUser(Principal author) {
        String username = author.getName();

        return getUserFromUsername(username);
    }

    private Sort parseSortParam(String sortParam) {
        String[] parts = sortParam.split(",");
        List<Sort.Order> orders = new ArrayList<>();

        for (String part : parts) {
            String[] fieldAndDirection = part.trim().split("\\s+");
            if (fieldAndDirection.length == 1) {
                orders.add(new Sort.Order(Sort.Direction.ASC, fieldAndDirection[0]));
            } else {
                Sort.Direction direction = Sort.Direction.fromString(fieldAndDirection[1]);
                orders.add(new Sort.Order(direction, fieldAndDirection[0]));
            }
        }

        return Sort.by(orders);
    }

    public List<Article> getAllArticles() {
        List<ArticleEntity> entities = articleRepository.findAll();

        return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());
    }

    public List<Article> getArticlesParams(int size, int from, String title, String author, LocalDateTime createdDate, String sort) {
        Page<ArticleEntity> entities;
        Sort sortCriteria = parseSortParam(sort);
        Pageable page = PageRequest.of(from, size, sortCriteria);

        Specification<ArticleEntity> specification = new SpecificationBuilder<ArticleEntity>()
                .and(ArticleSpecification.hasTitle(title))
                .and(ArticleSpecification.hasAuthor(author))
                .and(ArticleSpecification.createdAfter(createdDate))
                .build();

        entities = articleRepository.findAll(specification, page);

        return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());

//        if (title != null && author != null) {
//            entities = articleRepository.findAllByTitleAndAuthor(title, getUserFromUsername(author), page);
//            return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());
//        }
//        if (title != null) {
//            entities = articleRepository.findAllByTitle(title, page);
//            return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());
//        }
//        if (author != null) {
//            entities = articleRepository.findAllByAuthor(getUserFromUsername(author), page);
//            return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());
//        }
//
//        entities = articleRepository.findAll(page);
//
//        return entities.stream().map(ArticleConvertor::toDto).collect(Collectors.toList());
    }

    public Article getArticleById(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);

        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        return ArticleConvertor.toDto(article.get());
    }

    public void deleteArticle(UUID id) {
        Optional<ArticleEntity> article = articleRepository.findById(id);
        if (article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        articleRepository.deleteById(id);
    }

    public Article createArticle(ArticleRequest articleRequest, Principal principal) {
        if (!isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        UserEntity author = getPrincipalUser(principal);

        ArticleEntity newArticle = new ArticleEntity(null, articleRequest.title(), articleRequest.content(), summarize(articleRequest.content()), LocalDateTime.now(), LocalDateTime.now(), null, new ArrayList<String>(), null, null, null, null, null, null, author, author);

        return ArticleConvertor.toDto(articleRepository.save(newArticle));
    }

    public Article updateArticle(UUID id, ArticleRequest articleRequest, Principal principal) {
        if (!isValidRequest(articleRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        UserEntity editor = getPrincipalUser(principal);

        Optional<ArticleEntity> article = articleRepository.findById(id);

        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        ArticleEntity newArticle = article.get();

        newArticle.setContent(articleRequest.content());
        newArticle.setTitle(articleRequest.title());
        newArticle.setSummary(summarize(articleRequest.content()));
        newArticle.setUpdatedDate(LocalDateTime.now());
        newArticle.setEditor(editor);

        return ArticleConvertor.toDto(articleRepository.save(newArticle));
    }

    public Article uploadImage(MultipartFile file, UUID id, Double cropX, Double cropY, Double cropWidth, Double cropHeight, Double cropScale, Principal principal) {
        Optional<ArticleEntity> article = articleRepository.findById(id);
        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        UserEntity editor = getPrincipalUser(principal);

        File directory = new File("uploads/article-images");
        if(!directory.exists()) {
            directory.mkdirs();
        }

        String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String fileName = "article-" + article.get().getId() + extension;
        String filePath = System.getProperty("user.dir") + "/uploads/article-images/" + fileName;
        Path path = Paths.get(filePath);
        try {
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload article image");
        }

        // Save the full image and crop metadata
        article.get().setImageUrl(fileName);
        article.get().setCropX(cropX);
        article.get().setCropY(cropY);
        article.get().setCropWidth(cropWidth);
        article.get().setCropHeight(cropHeight);
        article.get().setCropScale(cropScale);
        article.get().setUpdatedDate(LocalDateTime.now());
        article.get().setEditor(editor);

        return ArticleConvertor.toDto(articleRepository.save(article.get()));
    }

    public Article uploadMedia(MultipartFile file, UUID id, Principal principal) {
        Optional<ArticleEntity> article = articleRepository.findById(id);
        if(article.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found");
        }

        File directory = new File("uploads/article-media");
        if(!directory.exists()) {
            directory.mkdirs();
        }
        
        String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String fileName = "article-" + article.get().getId() + "-" + article.get().getMediaUrls().size() + extension;
        // String fileName = "media-" + UUID.randomUUID() + extension;
        String filePath = System.getProperty("user.dir") + "/uploads/article-media/" + fileName;
        Path path = Paths.get(filePath);
        try {
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload article media");
        }

        article.get().getMediaUrls().add(fileName);

        return ArticleConvertor.toDto(articleRepository.save(article.get()));
    }

}
