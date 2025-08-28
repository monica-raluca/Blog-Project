package com.cognizant.practice.blog.user.convertor;

import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.entity.UserEntity;

public class UserConvertor {
    public static User toDto(UserEntity userEntity) {
        return User.builder()
                .id(userEntity.getId())
                .lastName(userEntity.getLastName())
                .firstName(userEntity.getFirstName())
                .email(userEntity.getEmail())
                .createdDate(userEntity.getCreatedDate())
                .username(userEntity.getUsername())
                .role(userEntity.getRole())
                .profilePicture(userEntity.getProfilePicture())
                .categories(userEntity.getCategories())
                .build();
    }

    public static UserEntity toEntity(User user) {
        return UserEntity.builder()
                .id(user.getId())
                .lastName(user.getLastName())
                .firstName(user.getFirstName())
                .email(user.getEmail())
                .createdDate(user.getCreatedDate())
                .username(user.getUsername())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .categories(user.getCategories())
                .build();
    }
}
