import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + '/api/posts');
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/api/posts/${id}`);
  }

  getPostsByCategory(catId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/api/posts/category/${catId}`);
  }

  searchPosts(query: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/api/posts/search?q=${query}`);
  }

  createPost(post: Post, photo: File | null): Observable<Post> {
    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(post)], { type: 'application/json' }));
    if (photo) {
      formData.append('photo', photo);
    }
    return this.http.post<Post>(`${this.apiUrl}/api/posts`, formData);
  }

  updatePost(id: number, post: Post, photo: File | null): Observable<Post> {
    const formData = new FormData();
    formData.append('post', new Blob([JSON.stringify(post)], { type: 'application/json' }));
    if (photo) {
      formData.append('photo', photo);
    }
    return this.http.put<Post>(`${this.apiUrl}/api/posts/${id}`, formData);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/posts/${id}`);
  }
}
