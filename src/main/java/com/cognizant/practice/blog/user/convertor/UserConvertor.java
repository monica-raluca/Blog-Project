package com.cognizant.practice.blog.user.convertor;

import com.cognizant.practice.blog.user.dto.UserDto;
import com.cognizant.practice.blog.user.entity.UserEntity;

public class UserConvertor {
    public static UserDto toDto(UserEntity userEntity) {
        return UserDto.builder()
                .lastName(userEntity.getLastName())
                .firstName(userEntity.getFirstName())
                .email(userEntity.getEmail())
                .createdDate(userEntity.getCreatedDate())
                .username(userEntity.getUsername())
                .build();
    }
}
