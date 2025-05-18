package com.example.demo.repository;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.User;
import com.example.demo.entity.Post;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    boolean existsByUserAndPost(User user, Post post);
    @Transactional
    void deleteByUserAndPost(User user, Post post);

    @Query("SELECT f.post FROM Favorite f WHERE f.user.username = :username")
    List<Post> findFavoritePostsByUsername(@Param("username") String username);
}