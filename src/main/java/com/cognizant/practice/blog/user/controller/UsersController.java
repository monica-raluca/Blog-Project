package com.cognizant.practice.blog.user.controller;

import com.cognizant.practice.blog.security.JwtService;
import com.cognizant.practice.blog.user.dto.*;
import com.cognizant.practice.blog.user.service.UsersService;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
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

    @PostMapping(value="/users/register")
    public String createUser(@RequestBody UserRequest userRequest) {
        return usersService.createUser(userRequest);
    }

    @PostMapping(value="/users/login")
    public String loginUser(@RequestBody UserLoginRequest userLoginRequest) {
        return usersService.loginUser(userLoginRequest);
    }

    @DeleteMapping(value="/users/{id}")
    public void deleteUser(@PathVariable UUID id) {
        usersService.deleteUser(id);
    }

    @PutMapping(value="/users/{id}/role")
    public User updateUserRole(@PathVariable UUID id, @RequestBody Role role) {
        return usersService.updateUserRole(id, role);
    }
}
