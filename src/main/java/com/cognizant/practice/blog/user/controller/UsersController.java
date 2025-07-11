package com.cognizant.practice.blog.user.controller;

import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.dto.UserRequest;
import com.cognizant.practice.blog.user.service.UsersService;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class UsersController {
    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @GetMapping(value="/users")
    public List<User> getAllUsers() {
        return usersService.getAllUsers();
    }

    @GetMapping(value="/users/{id}")
    public User getUserById(@PathVariable UUID id) {
        return usersService.getUserById(id);
    }

    @PostMapping(value="/users")
    public String createUser(@RequestBody UserRequest userRequest) {
        return usersService.createUser(userRequest);
    }
}
