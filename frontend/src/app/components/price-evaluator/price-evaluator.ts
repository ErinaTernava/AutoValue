import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
      mileage: ['', [Validators.required, Validators.min(100)]],
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      engineSize: ['', [Validators.required, Validators.min(0.1), Validators.max(6.0)]],
      mpg: ['', [Validators.required, Validators.min(1)]],
      asked_price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.loadBrands();
    this.setupDropdownLogic();
    this.setupVinListener();
  }

  private loadBrands() {
    this.carData.getBrands().subscribe(res => {
      this.brands = res.brands;
      this.brandsLoaded = true;
    });
  }

  private setupDropdownLogic() {
    this.form.get('brand')!.valueChanges.subscribe(brand => {
      if (!brand) return;
      this.models = [];
      this.years = [];
      this.form.patchValue(
        { model: '', year: '' },
        { emitEvent: false }
      );

      this.carData.getModels(brand).subscribe(res => {
        this.models = res.models;
      });
    });

    this.form.get('model')!.valueChanges.subscribe(model => {
      const brand = this.form.get('brand')!.value;
      if (!brand || !model) return;
      this.years = [];
      this.form.patchValue(
        { year: '' },
        { emitEvent: false }
      );
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
        }, { emitEvent: false });
      });
    });
  }

  private setupVinListener() {
    this.form.get('vin')!.valueChanges.subscribe(vin => {
      if (!vin) {
        this.resetDependentDropdowns();
        return;
      }
      if (vin.length >= 17) {
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

  private resetDependentDropdowns() {
    this.models = [];
    this.years = [];

    this.form.patchValue(
      {
        brand: '',
        model: '',
        year: '',
        fuelType: '',
        transmission: '',
        engineSize: '',
        mpg: ''
      },
      { emitEvent: false }
    );
  }

  resetForm() {
    this.form.reset();
    this.models = [];
    this.years = [];
    this.result = null;
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

  get savingsLabel(): string {
    if (!this.result) return '';
    const s = this.result.savings_eur;

    if (s > 0)
      return `You save €${Math.abs(s).toLocaleString('en', { maximumFractionDigits: 0 })} vs fair price`;

    if (s < 0)
      return `You overpay €${Math.abs(s).toLocaleString('en', { maximumFractionDigits: 0 })} vs fair price`;

    return 'Exactly at fair price';
  }
}