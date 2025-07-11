package com.cognizant.practice.blog.user.service;

import com.cognizant.practice.blog.security.JwtService;
import com.cognizant.practice.blog.user.convertor.UserConvertor;
import com.cognizant.practice.blog.user.dto.Role;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.dto.UserRequest;
import com.cognizant.practice.blog.user.entity.UserEntity;
import com.cognizant.practice.blog.user.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsersService {
    public UserRepository userRepository;
    public PasswordEncoder passwordEncoder;
    public JwtService jwtService;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    public List<User> getAllUsers() {
        List<UserEntity> entities = userRepository.findAll();

        return entities.stream().map(UserConvertor::toDto).collect(Collectors.toList());
    }

    public User getUserById(UUID id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return UserConvertor.toDto(user.get());
    }

    public String createUser(UserRequest userRequest) {
        if (!isValidRequest(userRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        if(userRepository.findByUsername(userRequest.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        if(userRepository.findByEmail(userRequest.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        UserEntity newUser = new UserEntity(null, userRequest.lastName(), userRequest.firstName(), userRequest.username(), userRequest.email(), passwordEncoder.encode(userRequest.password()), LocalDateTime.now(), Role.USER);

//        return UserConvertor.toDto(userRepository.save(newUser));
        return jwtService.generateToken(userRepository.save(newUser));
    }
}
