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
                .build();
    }
}
