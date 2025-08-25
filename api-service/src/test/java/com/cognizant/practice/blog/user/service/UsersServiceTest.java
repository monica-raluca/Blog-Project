//package com.cognizant.practice.blog.user.service;
//
//import com.cognizant.practice.blog.security.JwtService;
//import com.cognizant.practice.blog.user.dto.User;
//import com.cognizant.practice.blog.user.dto.UserRequest;
//import com.cognizant.practice.blog.user.entity.UserEntity;
//import com.cognizant.practice.blog.user.repository.UserRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.server.ResponseStatusException;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class UsersServiceTest {
//    UserRepository mockUserRepository = mock(UserRepository.class);
//    PasswordEncoder mockPasswordEncoder = mock(PasswordEncoder.class);
//    JwtService mockJwtService = mock(JwtService.class);
//    AuthenticationManager mockAuthenticationManager = mock(AuthenticationManager.class);
//
//    UsersService usersService = new UsersService(mockUserRepository, mockPasswordEncoder, mockJwtService, mockAuthenticationManager);
//
//    @Test
//    void shouldGetAllUsers() {
//        List<UserEntity> entityList = List.of(new UserEntity(null, "last name 1", "first1", null, null, null, null, null),
//                new UserEntity(null, "last name 2", "first2", null, null, null, null, null));
//
//        when(mockUserRepository.findAll()).thenReturn(entityList);
//
//        List<User> result = usersService.getAllUsers();
//
//        assertEquals(entityList.size(), result.size());
//        assertEquals("last name 1", result.getFirst().getLastName());
//        assertEquals("first2", result.get(1).getFirstName());
//    }
//
//    @Test
//    void shouldGetUserById() {
//        UUID uuid = UUID.randomUUID();
//        UserEntity userEntity = new UserEntity();
//        userEntity.setUsername("username");
//
//        when(mockUserRepository.findById(uuid)).thenReturn(Optional.of(userEntity));
//
//        User user = usersService.getUserById(uuid);
//
//        assertEquals(userEntity.getId(), user.getId());
//    }
//
//    @Test
//    void shouldThrowExceptionGetWhenUserNotFound() {
//        UUID uuid = UUID.randomUUID();
//
//        when(mockUserRepository.findById(uuid)).thenReturn(Optional.empty());
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.getUserById(uuid));
//
//        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
//        assertEquals("User not found", thrown.getReason());
//    }
//
//    @Test
//    void shouldCreateUser() {
//        UserRequest userRequest = new UserRequest("last name", "first name", "pass", "email", "username");
//        UserEntity userEntity = new UserEntity();
//
//        userEntity.setUsername(userRequest.username());
//        userEntity.setPassword(userRequest.password());
//
//        when(mockJwtService.generateToken(userEntity)).thenReturn("wow");
//        when(mockUserRepository.save(any(UserEntity.class))).thenReturn(userEntity);
//        when(mockPasswordEncoder.encode("pass")).thenReturn("bigWOW");
//
//        String result = usersService.createUser(userRequest);
//
//        assertEquals("wow", result);
//        verify(mockUserRepository).save((any(UserEntity.class)));
//        verify(mockJwtService).generateToken(userEntity);
//        verify(mockPasswordEncoder).encode("pass");
//    }
//
//    @Test
//    void shouldThrowExceptionCreateInvalidLastName() {
//        UserRequest userRequest = new UserRequest("", "first", "pass", "email", "user");
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateInvalidFirstName() {
//        UserRequest userRequest = new UserRequest("last", "", "pass", "email", "user");
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateInvalidPassword() {
//        UserRequest userRequest = new UserRequest("last", "first", null, "email", "user");
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateInvalidEmail() {
//        UserRequest userRequest = new UserRequest("last", "first", "pass", null, "user");
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateInvalidUsername() {
//        UserRequest userRequest = new UserRequest("last", "first", "pass", "email", null);
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateUsernameExists() {
//        UserRequest userRequest = new UserRequest("last", "first", "pass", "email", "username");
//
//        when(mockUserRepository.findByUsername(userRequest.username())).thenReturn(Optional.of(new UserEntity(null, "last", "first", "user", "email", "pass", null, null)));
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//        assertEquals("Username already exists", thrown.getReason());
//    }
//
//    @Test
//    void shouldThrowExceptionCreateEmailExists() {
//        UserRequest userRequest = new UserRequest("last", "first", "pass", "email", "username");
//
//        when(mockUserRepository.findByEmail(userRequest.email())).thenReturn(Optional.of(new UserEntity(null, "last", "first", "user", "email", "pass", null, null)));
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.createUser(userRequest));
//
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
//        assertEquals("Email already exists", thrown.getReason());
//    }
//
//    @Test
//    void shouldDeleteUser() {
//        UUID id = UUID.randomUUID();
//        UserEntity user = new UserEntity();
//        user.setId(id);
//
//        when(mockUserRepository.findById(id)).thenReturn(Optional.of(user));
//
//        usersService.deleteUser(id);
//
//        verify(mockUserRepository).findById(id);
//        verify(mockUserRepository).deleteById(id);
//    }
//
//    @Test
//    void shouldThrowExceptionDeleteWhenUserNotFound() {
//        UUID id = UUID.randomUUID();
//
//        when(mockUserRepository.findById(id)).thenReturn(Optional.empty());
//
//        ResponseStatusException thrown = assertThrows(ResponseStatusException.class, () -> usersService.deleteUser(id));
//
//        assertEquals(HttpStatus.NOT_FOUND, thrown.getStatusCode());
//    }
//}