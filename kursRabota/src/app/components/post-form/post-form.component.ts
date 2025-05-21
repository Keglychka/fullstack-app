import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { Post } from '../../models/post.model';
import { Category } from '../../models/category.model';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';

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
  stepCountOptions = Array.from({ length: 20 }, (_, i) => i + 1);
  previewUrl: string | null = null;
  postPhoto: string | null = null;
  private baseUrl = 'http://localhost:8080';

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
      photo: [null],
      anons: ['', [Validators.required]],
      ingredients: ['', [Validators.required]],
      category: ['', Validators.required],
      stepCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      steps: this.fb.array([]),
      preparationTime: [0, [Validators.required, Validators.min(0)]],
      cookingTime: [0, [Validators.required, Validators.min(0)]],
      temperature: ['', [Validators.min(0), Validators.max(300)]],
      ingredientItems: this.fb.array([]),
      ingredientAmounts: this.fb.group({})
    });
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.error = 'User not authenticated';
      this.router.navigate(['/login']);
      return;
    }

    this.initFormControls();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadPostForEdit(+id);
    }
  }

  private initFormControls(): void {
    this.postForm.get('stepCount')?.valueChanges.subscribe(count => {
      this.updateSteps(count);
    });
    this.updateSteps(1);

    this.postForm.get('ingredients')?.valueChanges.subscribe(ingredients => {
      this.updateIngredientsList(ingredients);
    });
  }

  private loadPostForEdit(id: number): void {
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        const steps = post.description?.split('\n')
          .filter(step => step.startsWith('Шаг'))
          .map(step => step.replace(/^Шаг \d+: /, '')) || [''];

        this.postForm.patchValue({
          title: post.title,
          anons: post.anons,
          ingredients: post.ingredients,
          category: post.category.catId,
          stepCount: steps.length || 1,
          preparationTime: post.preparationTime || 0,
          cookingTime: post.cookingTime || 0,
          temperature: post.temperature || ''
        });

        this.updateSteps(steps.length || 1);
        steps.forEach((step, i) => this.steps.at(i).setValue(step));

        if (post.photo) {
          this.postPhoto = `${this.baseUrl}${post.photo}`;
        }

        if (post.ingredientItems?.length) {
          post.ingredientItems.forEach(item => {
            this.addIngredient(item.name, item.amount, item.unit);
          });
        } else if (post.ingredientAmounts) {
          Object.entries(post.ingredientAmounts).forEach(([name, amount]) => {
            this.addIngredient(name, amount, 'г'); // По умолчанию граммы
          });
        }
      },
      error: (err) => this.error = 'Failed to load post'
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories.length ? categories : this.getDefaultCategories();
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.categories = this.getDefaultCategories();
      }
    });
  }

  private getDefaultCategories(): Category[] {
    return [
      { catId: 1, name: 'Русская кухня' },
      { catId: 2, name: 'Грузинская кухня' },
      { catId: 3, name: 'Итальянская кухня' }
    ];
  }

  // Ingredient Items methods
  get ingredientItems(): FormArray {
    return this.postForm.get('ingredientItems') as FormArray;
  }

  addIngredient(name: string = '', amount: number = 0, unit: string = 'г'): void {
    this.ingredientItems.push(this.fb.group({
      name: [name, [Validators.required, Validators.maxLength(50)]],
      amount: [amount, [Validators.required, Validators.min(0)]],
      unit: [unit, Validators.required]
    }));
  }

  removeIngredient(index: number): void {
    this.ingredientItems.removeAt(index);
  }

  // Steps methods
  get steps(): FormArray {
    return this.postForm.get('steps') as FormArray;
  }

  private updateSteps(count: number): void {
    const steps = this.steps;
    while (steps.length !== count) {
      if (steps.length < count) {
        steps.push(this.fb.control('', [Validators.required, Validators.minLength(1)]));
      } else {
        steps.removeAt(steps.length - 1);
      }
    }
  }

  // Ingredients methods
  private updateIngredientsList(ingredientsStr: string): void {
    const ingredientsList = this.parseIngredients(ingredientsStr);
    this.updateIngredientAmountsControls(ingredientsList);
  }

  private parseIngredients(ingredientsStr: string): string[] {
    if (!ingredientsStr) return [];
    return ingredientsStr
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.split(':')[0].trim());
  }

  getIngredientUnit(ingredient: string): string {
    const ingredientsStr = this.postForm.get('ingredients')?.value;
    if (!ingredientsStr) return '';
    
    const lines: string[] = ingredientsStr.split('\n');
    const line = lines.find((l: string) => l.trim().startsWith(ingredient));
    if (!line) return '';
    
    const parts = line.split(':');
    if (parts.length < 2) return '';
    
    const amountPart = parts[1].trim();
    const unitMatch = amountPart.match(/([^\d\s]+)$/);
    return unitMatch ? unitMatch[0].trim() : '';
  }

  private updateIngredientAmountsControls(ingredientsList: string[]): void {
    const amountsGroup = this.postForm.get('ingredientAmounts') as FormGroup;
    
    Object.keys(amountsGroup.controls).forEach(controlName => {
      amountsGroup.removeControl(controlName);
    });
    
    ingredientsList.forEach(ingredient => {
      amountsGroup.addControl(ingredient, new FormControl(0, [Validators.required, Validators.min(0)]));
    });
  }

  // File handling
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.photo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.photo);
    }
  }

  // Form submission
  submit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const postData = this.preparePostData();
    const action = this.isEdit
      ? this.postService.updatePost(postData.idPost!, postData, this.photo)
      : this.postService.createPost(postData, this.photo);

    action.subscribe({
      next: () => this.router.navigate(['/posts']),
      error: (err) => this.error = err.error?.message || 'Failed to save post'
    });
  }

  private preparePostData(): Post {
    const steps = this.steps.controls.map(control => control.value).filter(step => step?.trim());
    const description = steps.length > 0
      ? steps.map((step, index) => `Шаг ${index + 1}: ${step}`).join('\n')
      : 'Нет шагов';

    // Преобразуем ingredientItems в ingredientAmounts для совместимости
    const ingredientAmounts: { [key: string]: number } = {};
    this.ingredientItems.value.forEach((item: any) => {
      ingredientAmounts[item.name] = item.amount;
    });

    // Генерируем текстовое представление ингредиентов
    const ingredientsText = this.ingredientItems.value
      .map((item: any) => `${item.name}: ${item.amount} ${item.unit}`)
      .join('\n');

    return {
      idPost: this.isEdit ? Number(this.route.snapshot.paramMap.get('id')) : undefined,
      title: this.postForm.value.title,
      anons: this.postForm.value.anons,
      description: description,
      ingredients: ingredientsText, // Сохраняем для обратной совместимости
      ingredientItems: this.ingredientItems.value,
      ingredientAmounts: ingredientAmounts,
      category: this.categories.find(cat => cat.catId === Number(this.postForm.value.category)) || 
               { catId: this.postForm.value.category, name: '' },
      author: { username: '' },
      dateCreate: '',
      preparationTime: this.postForm.value.preparationTime,
      cookingTime: this.postForm.value.cookingTime,
      temperature: this.postForm.value.temperature,
      photo: this.postForm.value.photo
    };
  }

  get f(): { [key: string]: AbstractControl } {
    return this.postForm.controls;
  }
}