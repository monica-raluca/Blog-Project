package com.cognizant.practice.blog.user.dto;

public record UserRequest(String lastName, String firstName, String password, String email, String username) {
}
