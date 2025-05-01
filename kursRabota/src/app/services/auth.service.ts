import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

interface AuthResponse {
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'token';

  constructor(private http: HttpClient, private router: Router) { }

  register(user: User): Observable<string> {
    return this.http.post<{token: string}>(
      `${this.apiUrl}/register`,
      user
    ).pipe(
      map(response => response.token),
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        this.router.navigate(['/posts']);
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: { username: string; password: string }): Observable<string> {
    return this.http.post<{token: string}>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      map(response => response.token),
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        this.router.navigate(['/posts']);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ошибка сервера';
    
    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка
      errorMessage = error.error.message;
    } else {
      // Серверная ошибка
      if (typeof error.error === 'string') {
        // Если ошибка пришла как строка
        errorMessage = error.error;
      } else if (error.error?.message) {
        // Если ошибка пришла как JSON {message: "текст"}
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Неверные учетные данные';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}