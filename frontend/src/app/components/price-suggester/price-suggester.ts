import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Endpoints } from '../../services/endpoints';
import { CarDataService } from '../../services/car-data.service';
import { Header } from '../common/header/header';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-suggester',
  imports: [
    ReactiveFormsModule,
    Header,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './price-suggester.html',
  styleUrl: './price-suggester.scss',
})
export class PriceSuggester implements OnInit {
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
          fuelType: res.fuelType,
          transmission: res.transmission,
          engineSize: res.engineSize,
          mpg: res.mpg
        });
      });
    });
  }

  submit() {
    this.loading = true;
    this.result = null;
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
    this.models = [];
    this.years = [];
    this.result = null;
  }
}