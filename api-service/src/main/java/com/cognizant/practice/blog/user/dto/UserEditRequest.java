package com.cognizant.practice.blog.user.dto;

public record UserEditRequest(String lastName, String firstName, String email, String username, Role role) {
}
