package com.cognizant.practice.blog.user.service;

import com.cognizant.practice.blog.security.JwtService;
import com.cognizant.practice.blog.user.convertor.UserConvertor;
import com.cognizant.practice.blog.user.dto.Role;
import com.cognizant.practice.blog.user.dto.User;
import com.cognizant.practice.blog.user.dto.UserEditRequest;
import com.cognizant.practice.blog.user.dto.UserLoginRequest;
import com.cognizant.practice.blog.user.dto.UserRequest;
import com.cognizant.practice.blog.user.entity.UserEntity;
import com.cognizant.practice.blog.user.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.nio.file.Path;
import java.io.IOException;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;

@Service
public class UsersService {
    public UserRepository userRepository;
    public PasswordEncoder passwordEncoder;
    public JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
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

    public boolean isValidRequest(UserEditRequest request) {
        return isValidParam(request.lastName()) &&
                isValidParam(request.firstName()) &&
                isValidParam(request.username()) &&
                isValidParam(request.email()) &&
                (request.role() == Role.ROLE_AUTHOR || request.role() == Role.ROLE_USER || request.role() == Role.ROLE_ADMIN);
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

    public User getUserByUsername(String username) {
        Optional<UserEntity> user = userRepository.findByUsername(username);
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

        UserEntity newUser = new UserEntity(null, userRequest.lastName(), userRequest.firstName(), userRequest.username(), userRequest.email(), passwordEncoder.encode(userRequest.password()), null,LocalDateTime.now(), Role.ROLE_USER, null, null);

//         return jwtService.generateToken(userRepository.save(newUser));
        Map<String, Object> extraClaims = new HashMap<>();
        Collection<? extends GrantedAuthority> authorities = newUser.getAuthorities();
        extraClaims.put("authorities", authorities);

        return jwtService.generateToken(extraClaims, userRepository.save(newUser));
    }

    public String loginUser(UserLoginRequest userLoginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userLoginRequest.username(), userLoginRequest.password()));
        UserEntity user = userRepository.findByUsername(userLoginRequest.username()).orElseThrow();
        // return jwtService.generateToken(userRepository.findByUsername(userLoginRequest.username()).orElseThrow());
        Map<String, Object> extraClaims = new HashMap<>();
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        extraClaims.put("authorities", authorities);

        return jwtService.generateToken(extraClaims, user);
    }

    public void deleteUser(UUID id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if (user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        userRepository.deleteById(id);
    }

    public User updateUserRole(UUID id, Role role) {
        Optional<UserEntity> user = userRepository.findById(id);
        if(user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        user.get().setRole(role);
        return UserConvertor.toDto(userRepository.save(user.get()));
    }

    public User updateUser(UUID id, UserEditRequest userRequest) {
        if (!isValidRequest(userRequest)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fields can not be empty");
        }

        for (UserEntity user : userRepository.findAll()) {
            if (user.getId().equals(id)) {
                continue;
            }

            if (user.getEmail().equals(userRequest.email()) || user.getUsername().equals(userRequest.username())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or username already exist");
            }
        }

        Optional<UserEntity> user = userRepository.findById(id);
        if(user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        user.get().setLastName(userRequest.lastName());
        user.get().setFirstName(userRequest.firstName());
        user.get().setUsername(userRequest.username());
        user.get().setEmail(userRequest.email());
        user.get().setRole(userRequest.role());
        user.get().setProfilePicture(userRequest.profilePicture());

        return UserConvertor.toDto(userRepository.save(user.get()));
    }

    public User uploadProfilePicture(MultipartFile file, UUID id) {
        Optional<UserEntity> user = userRepository.findById(id);
        if(user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        File directory = new File("uploads/profile-pictures");
        if(!directory.exists()) {
            directory.mkdirs();
        }

        String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String fileName = "user-" + user.get().getId() + extension;
        String filePath = System.getProperty("user.dir") + "/uploads/profile-pictures/" + fileName;
        Path path = Paths.get(filePath);
        try {
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile picture");
        }

        user.get().setProfilePicture(fileName);
        // return filePath;
        return UserConvertor.toDto(userRepository.save(user.get()));
    }
}
