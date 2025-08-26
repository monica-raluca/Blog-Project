package com.cognizant.practice.blog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve profile pictures
        registry.addResourceHandler("/profile-pictures/**")
                .addResourceLocations("file:uploads/profile-pictures/");
        
        // Serve media files
        registry.addResourceHandler("/article-media/**")
                .addResourceLocations("file:uploads/article-media/");
        
        // Serve article cover images
        registry.addResourceHandler("/article-images/**")
                .addResourceLocations("file:uploads/article-images/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow frontend to access images for canvas operations
        registry.addMapping("/article-images/**")
                .allowedOrigins("http://localhost:1234", "http://localhost:3000")
                .allowedMethods("GET")
                .allowedHeaders("*")
                .allowCredentials(false);
        
        registry.addMapping("/profile-pictures/**")
                .allowedOrigins("http://localhost:1234", "http://localhost:3000")
                .allowedMethods("GET")
                .allowedHeaders("*")
                .allowCredentials(false);
                
        registry.addMapping("/article-media/**")
                .allowedOrigins("http://localhost:1234", "http://localhost:3000")
                .allowedMethods("GET")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}