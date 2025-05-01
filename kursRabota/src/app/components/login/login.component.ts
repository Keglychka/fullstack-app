import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  error: string | null = null;

  constructor(private authService: AuthService) { }

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // Перенаправление уже обрабатывается в AuthService
      },
      error: (err: Error) => {
        this.error = err.message;
      }
    });
  }
}