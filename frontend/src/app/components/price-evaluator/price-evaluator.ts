import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Endpoints } from '../../services/endpoints';
import { CarDataService } from '../../services/car-data.service';
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
export class PriceEvaluator implements OnInit {
  form: FormGroup;
  result: any = null;
  loading = false;

  brands: string[] = [];
  models: string[] = [];
  years: number[] = [];
  fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  transmissions = ['Manual', 'Automatic', 'Semi-Auto'];

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
    private carData: CarDataService
  ) {
    this.form = this.fb.group({
      brand:        ['', Validators.required],
      model:        ['', Validators.required],
      year:         ['', Validators.required],
      mileage:      ['', [Validators.required, Validators.min(100)]],
      fuelType:     ['', Validators.required],
      transmission: ['', Validators.required],
      engineSize:   ['', [Validators.required, Validators.min(0.1), Validators.max(6.0)]],
      mpg:          ['', [Validators.required, Validators.min(1)]],
      asked_price:  ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.carData.getBrands().subscribe(res => {
      this.brands = res.brands;
    });

    this.form.get('brand')!.valueChanges.subscribe(brand => {
      if (!brand) return;
      this.models = [];
      this.years = [];
      this.form.patchValue({ model: '', year: '', fuelType: '', transmission: '', engineSize: '', mpg: '' });
      this.carData.getModels(brand).subscribe(res => {
        this.models = res.models;
      });
    });

    this.form.get('model')!.valueChanges.subscribe(model => {
      const brand = this.form.get('brand')!.value;
      if (!brand || !model) return;
      this.years = [];
      this.form.patchValue({ year: '', fuelType: '', transmission: '', engineSize: '', mpg: '' });
      this.carData.getYears(brand, model).subscribe(res => {
        this.years = res.years;
      });
    });

    this.form.get('year')!.valueChanges.subscribe(year => {
      const brand = this.form.get('brand')!.value;
      const model = this.form.get('model')!.value;
      if (!brand || !model || !year) return;
      this.carData.getCarDetails(brand, model, year).subscribe(res => {
        this.form.patchValue({
          fuelType:     res.fuelType,
          transmission: res.transmission,
          engineSize:   res.engineSize,
          mpg:          res.mpg
        });
      });
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.result = null;
    this.api.evaluate(this.form.value).subscribe({
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
    this.models = [];
    this.years = [];
    this.result = null;
  }

  get savingsLabel(): string {
    if (!this.result) return '';
    const s = this.result.savings_eur;
    if (s > 0) return `You save €${Math.abs(s).toLocaleString('en', { maximumFractionDigits: 0 })} vs fair price`;
    if (s < 0) return `You overpay €${Math.abs(s).toLocaleString('en', { maximumFractionDigits: 0 })} vs fair price`;
    return 'Exactly at fair price';
  }
}