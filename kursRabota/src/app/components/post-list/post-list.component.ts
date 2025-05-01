import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { Post } from '../../models/post.model';
import { Category } from '../../models/category.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  categories: Category[] = [];
  searchQuery: string = '';
  selectedCategoryId: number | string = ''; // Добавляем переменную для ngModel

  constructor(
    private postService: PostService,
    private categoryService: CategoryService,
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPosts();
    this.loadCategories();
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (posts) => this.posts = posts,
      error: (err) => console.error('Failed to load posts', err)
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  searchPosts(): void {
    if (this.searchQuery.trim()) {
      this.postService.searchPosts(this.searchQuery).subscribe({
        next: (posts) => this.posts = posts,
        error: (err) => console.error('Failed to search posts', err)
      });
    } else {
      this.loadPosts();
    }
  }

  filterByCategory(catId: number | string): void {
    if (catId) {
      this.postService.getPostsByCategory(Number(catId)).subscribe({
        next: (posts) => this.posts = posts,
        error: (err) => console.error('Failed to filter posts', err)
      });
    } else {
      this.loadPosts();
    }
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => this.loadPosts(),
        error: (err) => console.error('Failed to delete post', err)
      });
    }
  }
}