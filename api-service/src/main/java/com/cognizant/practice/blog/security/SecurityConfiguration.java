package com.cognizant.practice.blog.security;

import com.cognizant.practice.blog.user.dto.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(JwtAuthenticationFilter jwtAuthenticationFilter, AuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.PUT, "/articles/*/comments/*").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/articles/*/comments/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/articles/*/comments").permitAll()
                        .requestMatchers(HttpMethod.POST, "/articles/*/comments").hasRole("USER")
                        .requestMatchers(HttpMethod.DELETE, "/articles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/articles/**").hasRole("AUTHOR")
                        .requestMatchers(HttpMethod.POST, "/articles/**").hasRole("AUTHOR")
                        .requestMatchers(HttpMethod.POST, "/articles/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/users/*/role").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                        .requestMatchers("/users/login", "/users/register").permitAll()
                        .anyRequest().permitAll())
//                        .anyRequest().authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider).addFilterAfter(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withDefaultRolePrefix()
                .role("ADMIN").implies("AUTHOR")
                .role("AUTHOR").implies("USER")
                .build();
    }
}
