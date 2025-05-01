import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = { username: '', password: ''};
  error: string | null = null;

  constructor(private authService: AuthService) { }

  register(): void {
    console.log('Attempting registration with:', this.user);
    this.authService.register(this.user).subscribe({
      next: () => {
        console.log('Регистрация успешна');
        // Перенаправление обрабатывается в AuthService
      },
      error: (err) => {
        console.error('Ошибка регистрации:', err);
        this.error = err.error?.message || err.message || 'Имя пользователя уже занято.';
      }
    });
  }
}