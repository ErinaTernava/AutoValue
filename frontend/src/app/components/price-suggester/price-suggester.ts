import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Endpoints } from '../../services/endpoints';
import { Header } from '../common/header/header';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-suggester',
  imports: [
    ReactiveFormsModule,
    Header,
    MatFormFieldModule, 
    MatLabel, 
    MatInputModule,
    CommonModule
  ],
  templateUrl: './price-suggester.html',
  styleUrl: './price-suggester.scss',
})
export class PriceSuggester {
  form: FormGroup;

  result: any = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
  ) {
    this.form = this.fb.group({
      brand: [''],
      model: [''],
      year: [''],
      mileage: [''],
      fuelType: [''],
      transmission: [''],
      engineSize: [''],
      mpg: [''],
    });
  }

  submit() {
    this.loading = true;

    this.api.predict(this.form.value).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  resetForm() {
    this.form.reset();
  }
}
