package com.example.demo.controller;

import com.example.demo.entity.Post;
import com.example.demo.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{catId}")
    public List<Post> getPostsByCategory(@PathVariable Long catId) {
        return postService.getPostsByCategory(catId);
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam String q) {
        return postService.searchPosts(q);
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestPart("post") Post post, @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Creating post with username: " + username);
            Post createdPost = postService.createPost(post, photo, username);
            return ResponseEntity.ok(createdPost);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload photo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create post: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestPart("post") Post postDetails, @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Post updatedPost = postService.updatePost(id, postDetails, photo, username);
            return ResponseEntity.ok(updatedPost);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload photo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            postService.deletePost(id, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete post: " + e.getMessage());
        }
    }

    @GetMapping("/author/{username}")
    public ResponseEntity<List<Post>> getPostsByAuthor(@PathVariable String username) {
        try {
            List<Post> posts = postService.getPostsByAuthor(username);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/favorites")
    public List<Post> getUserFavorites() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return postService.getUserFavorites(username);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<?> addToFavorites(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            postService.addToFavorites(id, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/favorite")
    @Transactional
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            postService.removeFromFavorites(id, username);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}