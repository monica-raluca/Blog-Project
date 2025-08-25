package com.cognizant.practice.blog.config;

import org.springframework.context.annotation.Configuration;
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
        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:uploads/media/");
        
        // Serve article cover images
        registry.addResourceHandler("/article-images/**")
                .addResourceLocations("file:uploads/article-images/");
    }
}