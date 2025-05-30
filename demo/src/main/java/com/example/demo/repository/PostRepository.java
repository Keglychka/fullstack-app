package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByDateCreateDesc();
    List<Post> findByCategoryCatIdOrderByDateCreateDesc(Long catId);
    List<Post> findByTitleContainingIgnoreCaseOrderByDateCreateDesc(String title);
    List<Post> findByAuthorUsernameOrderByDateCreateDesc(String username);
}