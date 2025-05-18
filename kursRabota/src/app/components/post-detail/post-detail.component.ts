import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  error: string | null = null;
  cameFromProfile: boolean = false;
  isFavorite: boolean = false;

  constructor (
    private route: ActivatedRoute,
    private postService: PostService,
    public authService: AuthService,
    private router: Router,
    private navigationService: NavigationService ) { }

    ngOnInit(): void {
      this.checkFavorite();
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.cameFromProfile = this.navigationService.getPreviousUrl().includes('/profile');
      this.postService.getPostById(id).subscribe({
        next: (post) => {
          this.post = post;
          this.checkFavoriteStatus();
        },
        error: (err) => {
          console.error('Failed to load post:', err);
          this.error = 'Не удалось загрузить пост: ' + (err.error?.message || 'Попробуйте снова позже');
        }
      });
    }

  getSteps(): string[] {
    return this.post?.description
      ? this.post.description.split('\n').filter(step => step.startsWith('Шаг'))
      : [];
  }

  navigateBack(): void {
    if (this.cameFromProfile) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/posts']);
    }
  }

  isAuthor(): boolean {
    if (!this.post || !this.authService.isLoggedIn()) {
      return false;
    }
    const token = this.authService.getToken();
    if (!token) {
      return false;
    }
    // Извлекаем username из JWT-токена
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentUser = payload.sub;
    return this.post.author.username === currentUser;
  }

  deletePost(): void {
    if (this.post && confirm('Вы уверены, что хотите удалить этот пост?')) {
      this.postService.deletePost(this.post.idPost!).subscribe({
        next: () => {
          console.log('Post deleted successfully');
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          console.error('Failed to delete post:', err);
          alert('Ошибка при удалении поста: ' + (err.error?.message || 'Попробуйте снова'));
        }
      });
    }
  }

    checkFavorite(): void {
    if (this.authService.isLoggedIn() && this.post) {
      this.postService.getUserFavorites().subscribe({
        next: (favorites) => {
          this.isFavorite = favorites.some(fav => fav.idPost === this.post?.idPost);
        }
      });
    }
  }

    toggleFavorite(): void {
    if (!this.post) return;
  
    if (this.isFavorite) {
      this.postService.removeFromFavorites(this.post.idPost!).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (err) => {
          console.error('Failed to remove from favorites:', err);
        }
      });
    } else {
      this.postService.addToFavorites(this.post.idPost!).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (err) => {
          console.error('Failed to add to favorites:', err);
        }
      });
    }
  }

  checkFavoriteStatus(): void {
    if (this.authService.isLoggedIn() && this.post) {
      this.postService.getUserFavorites().subscribe({
        next: (favorites) => {
          this.isFavorite = favorites.some(fav => fav.idPost === this.post?.idPost);
        },
        error: (err) => {
          console.error('Error checking favorite status:', err);
        }
      });
    }
  }
}