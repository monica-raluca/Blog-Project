package com.cognizant.practice.blog.user.service;

import com.cognizant.practice.blog.security.JwtService;
import com.cognizant.practice.blog.user.convertor.UserConvertor;
import com.cognizant.practice.blog.user.dto.Role;
import com.cognizant.practice.blog.user.dto.UserDto;
import com.cognizant.practice.blog.user.dto.UserRequest;
import com.cognizant.practice.blog.user.entity.UserEntity;
import com.cognizant.practice.blog.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public List<UserDto> getAllUsers() {
        List<UserEntity> entities = userRepository.findAll();

        return entities.stream().map(UserConvertor::toDto).collect(Collectors.toList());
    }

    public Optional<UserDto> getUserById(UUID id) {
        Optional<UserEntity> user = userRepository.findById(id);

        return user.map(UserConvertor::toDto);
    }

    public String createUser(UserRequest userRequest) {
        UserEntity newUser = new UserEntity(null, userRequest.lastName(), userRequest.firstName(), userRequest.username(), userRequest.email(), passwordEncoder.encode(userRequest.password()), LocalDateTime.now(), Role.USER);

//        return UserConvertor.toDto(userRepository.save(newUser));
        return jwtService.generateToken(userRepository.save(newUser));
    }
}
