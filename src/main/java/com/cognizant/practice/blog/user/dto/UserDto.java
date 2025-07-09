package com.cognizant.practice.blog.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    private UUID id;

    private String lastName;
    private String firstName;
    private String username;
    private String email;
    private String password;

    private LocalDateTime createdDate;


}
