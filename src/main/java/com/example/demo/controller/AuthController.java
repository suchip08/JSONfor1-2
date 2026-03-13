package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.JwtUtil;
import com.example.demo.dto.AuthRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/auth/register — Register a new user
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody AuthRequest request) {
        Map<String, String> response = new HashMap<>();

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            response.put("message", "Username already exists!");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Create and save user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        userRepository.save(user);

        response.put("message", "Registration successful! You can now login.");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // POST /api/auth/login — Authenticate and return JWT token
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody AuthRequest request) {
        Map<String, String> response = new HashMap<>();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Generate JWT token
            String token = jwtUtil.generateToken(request.getUsername());

            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("username", request.getUsername());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            response.put("message", "Invalid username or password!");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }
}
