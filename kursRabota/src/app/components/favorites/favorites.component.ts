// favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: Post[] = [];
  loading = true;

  constructor(
    private postService: PostService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.postService.getUserFavorites().subscribe({
      next: (posts) => {
        this.favorites = posts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load favorites:', err);
        this.loading = false;
      }
    });
  }

  removeFromFavorites(postId: number): void {
    this.postService.removeFromFavorites(postId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(post => post.idPost !== postId);
        // Добавляем уведомление
        alert('Удалено из избранного!');
      },
      error: (err) => {
        console.error('Failed to remove from favorites:', err);
        alert('Ошибка при удалении из избранного: ' + err.message);
      }
    });
  }
}