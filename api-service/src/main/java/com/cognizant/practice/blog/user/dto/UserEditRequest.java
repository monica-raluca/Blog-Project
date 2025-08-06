package com.cognizant.practice.blog.user.dto;

public record UserEditRequest(String lastName, String firstName, String password, String email, String username, Role role) {
}
