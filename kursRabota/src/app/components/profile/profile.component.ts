import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userPosts: Post[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserPosts();
  }

  loadUserPosts(): void {
    const username = this.authService.getUsername();
    if (!username) {
      this.error = 'Не удалось определить пользователя';
      this.isLoading = false;
      return;
    }

    this.postService.getPostsByAuthor(username).subscribe({
      next: (posts) => {
        this.userPosts = posts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Ошибка загрузки рецептов';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  deletePost(id: number): void {
    if (confirm('Вы уверены, что хотите удалить этот рецепт?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(post => post.idPost !== id);
        },
        error: (err) => {
          console.error('Ошибка удаления:', err);
        }
      });
    }
  }
}