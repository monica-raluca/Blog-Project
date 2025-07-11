package com.cognizant.practice.blog.user.controller;

import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.dto.UserRequest;
import com.cognizant.practice.blog.user.service.UsersService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsersControllerTest {
    UsersService mockUsersService = mock(UsersService.class);
    UsersController usersController = new UsersController(mockUsersService);

    @Test
    void shouldGetAllUsers() {
        List<User> users = List.of(new User(null, "last name 1", "first name 1", null, null, null, null),
                new User(null, "last name 2", "first name 2", null, null, null, null));

        when(mockUsersService.getAllUsers()).thenReturn(users);

        List<User> result = usersController.getAllUsers();

        assertEquals(users.size(), result.size());
        assertEquals("last name 2", result.get(1).getLastName());
    }

    @Test
    void shouldGetUserById() {
        UUID uuid = UUID.randomUUID();
        User user = new User();
        user.setId(uuid);

        when(mockUsersService.getUserById(uuid)).thenReturn(user);

        User result = usersController.getUserById(uuid);

        assertEquals(user, result);
    }

    @Test
    void shouldCreateUser() {
        UserRequest userRequest = new UserRequest("last", "first", "pass", "email", "username");
        when(mockUsersService.createUser(userRequest)).thenReturn("wow");

        String result = usersController.createUser(userRequest);

        assertEquals("wow", result);
    }

}