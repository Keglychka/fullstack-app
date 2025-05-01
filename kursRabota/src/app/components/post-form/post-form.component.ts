import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { Post } from '../../models/post.model';
import { Category } from '../../models/category.model';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';


@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  photo: File | null = null;
  categories: Category[] = [];
  isEdit = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      anons: ['', [Validators.required]],
      description: ['', [Validators.required]],
      ingredients: ['', [Validators.required]],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('PostFormComponent: Initializing');
    // Проверка токена
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found');
      this.error = 'User not authenticated';
      this.router.navigate(['/login']);
      return;
    }
    console.log('Token found:', token);

    // Проверка режима редактирования
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.postService.getPostById(Number(id)).subscribe({
        next: (post) => {
          console.log('Post loaded for editing:', post);
          this.postForm.patchValue({
            title: post.title,
            anons: post.anons,
            description: post.description,
            ingredients: post.ingredients,
            category: post.category.catId
          });
          if (!post.category?.catId) {
            this.error = 'Категория поста не указана';
          }
        },
        error: (err) => {
          console.error('Failed to load post:', err);
          this.error = 'Failed to load post';
        }
      });
    }

      // Загрузка категорий
  this.categoryService.getAllCategories().subscribe({
    next: (categories) => {
      console.log('Категории загружены:', categories);
      this.categories = categories;
      if (categories.length === 0) {
        console.warn('No categories found, using fallback categories');
        this.categories = [
          { catId: 1, name: 'Русская кухня' },
          { catId: 2, name: 'Грузинская кухня' },
          { catId: 3, name: 'Итальянская кухня' }
        ];
      }
    },
    error: (err) => {
      console.error('Ошибка загрузки категории:', err);
      this.error = 'Failed to load categories. Using default categories.';
      this.categories = [
        { catId: 1, name: 'Русская кухня' },
        { catId: 2, name: 'Грузинская кухня' },
        { catId: 3, name: 'Итальянская кухня' }
      ];
    }
  });
  }



  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.photo = input.files[0];
    }
  }

  submit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const post: Post = {
      idPost: this.isEdit ? Number(this.route.snapshot.paramMap.get('id')) : undefined,
      title: this.postForm.value.title,
      anons: this.postForm.value.anons,
      description: this.postForm.value.description,
      ingredients: this.postForm.value.ingredients,
      category: this.categories.find(cat => cat.catId === Number(this.postForm.value.category)) || { catId: this.postForm.value.category, name: '' },
      author: { username: '' },
      dateCreate: ''
    };

    console.log('Submitting post:', post, 'Photo:', this.photo?.name);
    const action = this.isEdit
      ? this.postService.updatePost(post.idPost!, post, this.photo)
      : this.postService.createPost(post, this.photo);

    action.subscribe({
      next: () => {
        console.log('Post saved successfully');
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        console.error('Failed to save post:', err);
        this.error = err.error?.message || 'Failed to save post';
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.postForm.controls;
  }
}