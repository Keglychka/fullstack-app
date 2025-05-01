import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  error: string | null = null;

  constructor (
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private router: Router ) { }

    ngOnInit(): void {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.postService.getPostById(id).subscribe({
        next: (post) => {
          this.post = post;
          console.log('Post loaded:', post);
        },
        error: (err) => {
          console.error('Failed to load post:', err);
          this.error = 'Не удалось загрузить пост: ' + (err.error?.message || 'Попробуйте снова позже');
        }
      });
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
}