import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Endpoints } from '../../services/endpoints';
import { CarDataService } from '../../services/car-data.service';
import { Header } from '../common/header/header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

interface VinResponse {
  make?: string;
  model?: string;
  year?: string;
  fuel?: string;
  engine?: string;
}

@Component({
  selector: 'app-price-suggester',
  imports: [
    ReactiveFormsModule,
    Header,
    MatFormFieldModule,
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
  private brandsLoaded = false;

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
    private carData: CarDataService
  ) {
    this.form = this.fb.group({
      vin: [''],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      engineSize: ['', [Validators.required, Validators.min(0)]],
      mpg: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.carData.getBrands().subscribe(res => {
      this.brands = res.brands;
      this.brandsLoaded = true;
    });

    this.form.get('brand')!.valueChanges.subscribe(brand => {
      if (!brand) return;

      this.models = [];
      this.years = [];

      this.form.patchValue({ model: '', year: '' }, { emitEvent: false });

      this.carData.getModels(brand).subscribe(res => {
        this.models = res.models;
      });
    });

    this.form.get('model')!.valueChanges.subscribe(model => {
      const brand = this.form.get('brand')!.value;
      if (!brand || !model) return;

      this.years = [];

      this.form.patchValue({ year: '' }, { emitEvent: false });

      this.carData.getYears(brand, model).subscribe(res => {
        this.years = res.years;
      });
    });

    this.form.get('vin')!.valueChanges.subscribe(vin => {
      if (vin && vin.length >= 17) {
        this.onVin();
      }
    });
  }

  onVin() {
    const vin = this.form.get('vin')?.value;
    if (!vin || vin.length < 17) return;

    this.api.decodeVin(vin).subscribe({
      next: (res) => {

        const vinRes = res as VinResponse;

        const vinBrand = vinRes.make?.trim() ?? '';
        const vinModel = vinRes.model?.trim() ?? '';
        const year = Number(vinRes.year);

        if (!vinBrand || !this.brandsLoaded) return;

        const matchedBrand =
          this.brands.find(b =>
            b.toLowerCase().trim() === vinBrand.toLowerCase().trim()
          ) || vinBrand;

        this.form.patchValue({ brand: matchedBrand }, { emitEvent: false });

        this.carData.getModels(matchedBrand).subscribe({
          next: (modelsRes) => {

            this.models = modelsRes.models;

            const matchedModel =
              this.models.find(m =>
                m.toLowerCase().trim() === vinModel.toLowerCase().trim()
              ) || vinModel;

            this.form.patchValue({ model: matchedModel }, { emitEvent: false });

            this.carData.getYears(matchedBrand, matchedModel).subscribe({
              next: (yearsRes) => {

                this.years = yearsRes.years;

                this.form.patchValue({ year }, { emitEvent: false });

                this.form.patchValue({
                  fuelType: this.mapFuel(vinRes.fuel ?? '')
                }, { emitEvent: false });
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('VIN decode error:', err);
      }
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

  mapFuel(fuel: string): string {
    if (!fuel) return '';
    const f = fuel.toLowerCase();
    if (f.includes('gas')) return 'Petrol';
    if (f.includes('petrol')) return 'Petrol';
    if (f.includes('diesel')) return 'Diesel';
    if (f.includes('hybrid')) return 'Hybrid';
    if (f.includes('electric')) return 'Electric';

    return fuel;
  }
}