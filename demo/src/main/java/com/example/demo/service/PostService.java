package com.example.demo.service;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.entity.Favorite;
import com.example.demo.repository.FavoriteRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final String uploadDirPath = "D:/Учеба/4 курс/Курсовая/full/demo/target/classes/static/Uploads/";
    public PostService(PostRepository postRepository, UserService userService, UserRepository userRepository,
                       FavoriteRepository favoriteRepository) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
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
        User author = userRepository.findByUsername(username);
        if (author == null) {
            throw new RuntimeException("User not found");
        }
        post.setAuthor(author);
        post.setDateCreate(LocalDateTime.now());
        post.setDateUpdate(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            String originalFilename = photo.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + fileExtension;
            File uploadDir = new File(uploadDirPath);
            File destFile = new File(uploadDirPath + fileName);
            photo.transferTo(destFile);
            post.setPhoto("/Uploads/" + fileName);
        }

        if (post.getIngredientAmounts() == null) {
            post.setIngredientAmounts(Map.of());
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
        post.setPreparationTime(postDetails.getPreparationTime());
        post.setCookingTime(postDetails.getCookingTime());
        post.setTemperatureMode(postDetails.getTemperatureMode());
        post.setIngredientAmounts(postDetails.getIngredientAmounts());


        if (photo != null && !photo.isEmpty()) {
            if (post.getPhoto() != null) {
                File oldFile = new File(uploadDirPath + post.getPhoto().substring("/Uploads/".length()));
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            }
            String originalFilename = photo.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID() + fileExtension;
            File uploadDir = new File(uploadDirPath);
            File destFile = new File(uploadDirPath + fileName);
            photo.transferTo(destFile);
            post.setPhoto("/Uploads/" + fileName);
        }


        return postRepository.save(post);
    }

    public void deletePost(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        if (post.getPhoto() != null) {
            File file = new File(uploadDirPath + post.getPhoto().substring("/Uploads/".length()));
            if (file.exists()) {
                file.delete();
            }
        }

        postRepository.delete(post);
    }

    public List<Post> getPostsByAuthor(String username) {
        return postRepository.findByAuthorUsernameOrderByDateCreateDesc(username);
    }

    public List<Post> getUserFavorites(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        return favoriteRepository.findByUser(user).stream()
                .map(Favorite::getPost)
                .collect(Collectors.toList());
    }

    public void addToFavorites(Long postId, String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }

        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            throw new RuntimeException("Post not found with id: " + postId);
        }

        if (favoriteRepository.existsByUserAndPost(user, post)) {
            throw new RuntimeException("Post already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setPost(post);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFromFavorites(Long postId, String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }

        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            throw new RuntimeException("Post not found with id: " + postId);
        }

        favoriteRepository.deleteByUserAndPost(user, post);
    }
}
