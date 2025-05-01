package com.example.demo.service;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserService userService, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByDateCreateDesc();
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public List<Post> getPostsByCategory(Long catId) {
        return postRepository.findByCategoryCatIdOrderByDateCreateDesc(catId);
    }

    public List<Post> searchPosts(String query) {
        return postRepository.findByTitleContainingIgnoreCaseOrderByDateCreateDesc(query);
    }

    public Post createPost(Post post, MultipartFile photo, String username) throws IOException {
        System.out.println("PostService: Creating post for user: " + username);
        User author = userRepository.findByUsername(username);
        if (author == null) {
            throw new RuntimeException("User not found");
        }
        post.setAuthor(author);
        post.setDateCreate(LocalDateTime.now());
        post.setDateUpdate(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + photo.getOriginalFilename();
            File uploadDir = new File("Uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            photo.transferTo(new File("Uploads/" + fileName));
            post.setPhoto("/Uploads/" + fileName);
        }

        return postRepository.save(post);
    }

    public Post updatePost(Long id, Post postDetails, MultipartFile photo, String username) throws IOException {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to edit this post");
        }

        post.setTitle(postDetails.getTitle());
        post.setAnons(postDetails.getAnons());
        post.setDescription(postDetails.getDescription());
        post.setIngredients(postDetails.getIngredients());
        post.setCategory(postDetails.getCategory());
        post.setDateUpdate(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + photo.getOriginalFilename();
            photo.transferTo(new File("uploads/" + fileName));
            post.setPhoto("/uploads/" + fileName);
        }

        return postRepository.save(post);
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }
}
