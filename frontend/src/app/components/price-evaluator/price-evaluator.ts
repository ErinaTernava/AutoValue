import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Endpoints } from '../../services/endpoints';
import { Header } from '../common/header/header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-evaluator',
  imports: [
    ReactiveFormsModule,
    Header,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
  ],
  templateUrl: './price-evaluator.html',
  styleUrl: './price-evaluator.scss',
})
export class PriceEvaluator {
  form: FormGroup;
  result: any = null;
  loading = false;

  brands = ['audi', 'bmw', 'ford', 'hyundi', 'merc', 'skoda', 'toyota', 'vauxhall', 'vw'];
  fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  transmissions = ['Manual', 'Automatic', 'Semi-Auto'];

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
  ) {
    this.form = this.fb.group({
      brand:        ['', Validators.required],
      model:        ['', Validators.required],
      year:         ['', [Validators.required, Validators.min(1998), Validators.max(2020)]],
      mileage:      ['', [Validators.required, Validators.min(100)]],
      fuelType:     ['', Validators.required],
      transmission: ['', Validators.required],
      engineSize:   ['', [Validators.required, Validators.min(0.1), Validators.max(6.0)]],
      mpg:          ['', [Validators.required, Validators.min(1)]],
      asked_price:  ['', [Validators.required, Validators.min(0)]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.result  = null;

    this.api.evaluate(this.form.value).subscribe({
      next: (res) => {
        this.result  = res;
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
    this.result = null;
  }

  get savingsLabel(): string {
    if (!this.result) return '';
    const s = this.result.savings_eur;
    if (s > 0) return `You save €${Math.abs(s).toLocaleString('en', {maximumFractionDigits: 0})} vs fair price`;
    if (s < 0) return `You overpay €${Math.abs(s).toLocaleString('en', {maximumFractionDigits: 0})} vs fair price`;
    return 'Exactly at fair price';
  }
}