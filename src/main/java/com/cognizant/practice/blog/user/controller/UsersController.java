package com.cognizant.practice.blog.user.controller;

import com.cognizant.practice.blog.user.dto.UserDto;
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

    public boolean isValidParam(String param) {
        return !StringUtils.isEmpty(param);
    }

    public boolean isValidRequest(UserRequest request) {
        return isValidParam(request.lastName()) &&
                isValidParam(request.firstName()) &&
                isValidParam(request.username()) &&
                isValidParam(request.password()) &&
                isValidParam(request.email());
    }

    @GetMapping(value="/users")
    public List<UserDto> getAllUsers() {
        return usersService.getAllUsers();
    }

    @GetMapping(value="/users/{id}")
    public UserDto getUserById(@PathVariable UUID id) {
        Optional<UserDto> user = usersService.getUserById(id);
        return user.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping(value="/users")
    public String createUser(@RequestBody UserRequest userRequest) {
        if (!isValidRequest(userRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        return usersService.createUser(userRequest);
    }
}
