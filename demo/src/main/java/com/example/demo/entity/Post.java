package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPost;

    @Column(nullable = false)
    private String title;

    private String anons;
    @Column(length = 2000)
    private String description;
    @Column(length = 2000)
    private String ingredients;
    private String photo;

    @Column(updatable = false)
    private LocalDateTime dateCreate;

    private LocalDateTime dateUpdate;
    private Integer preparationTime;
    private Integer cookingTime;
    private String temperatureMode;
    @ElementCollection
    @CollectionTable(name = "post_ingredient_amounts",
            joinColumns = @JoinColumn(name = "post_id"))
    @MapKeyColumn(name = "ingredient_name")
    @Column(name = "amount")
    private Map<String, Double> ingredientAmounts;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne
    @JoinColumn(name = "cat_id", nullable = false)
    private Category category;

    // Геттеры и сеттеры
    public Long getIdPost() {
        return idPost;
    }

    public void setIdPost(Long idPost) {
        this.idPost = idPost;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAnons() {
        return anons;
    }

    public void setAnons(String anons) {
        this.anons = anons;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public LocalDateTime getDateCreate() {
        return dateCreate;
    }

    public void setDateCreate(LocalDateTime dateCreate) {
        this.dateCreate = dateCreate;
    }

    public LocalDateTime getDateUpdate() {
        return dateUpdate;
    }

    public void setDateUpdate(LocalDateTime dateUpdate) {
        this.dateUpdate = dateUpdate;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
    public Integer getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Integer preparationTime) {
        this.preparationTime = preparationTime;
    }

    public Integer getCookingTime() {
        return cookingTime;
    }

    public void setCookingTime(Integer cookingTime) {
        this.cookingTime = cookingTime;
    }

    public String getTemperatureMode() {
        return temperatureMode;
    }

    public void setTemperatureMode(String temperatureMode) {
        this.temperatureMode = temperatureMode;
    }

    public Map<String, Double> getIngredientAmounts() {
        return ingredientAmounts;
    }

    public void setIngredientAmounts(Map<String, Double> ingredientAmounts) {
        this.ingredientAmounts = ingredientAmounts;
    }
}