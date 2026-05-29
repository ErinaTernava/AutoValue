import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Header } from '../common/header/header';
import { Endpoints } from '../../services/endpoints';
import { CarDataService, CarDetails } from '../../services/car-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-car-comparison',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
  ],
  templateUrl: './car-comparison.html',
  styleUrls: ['./car-comparison.scss']
})
export class CarComparison implements OnInit {

  car1Form: FormGroup;
  car2Form: FormGroup;
  weightsForm: FormGroup;


  brands: string[] = [];
  car1Models: string[] = [];
  car2Models: string[] = [];
  car1Years: number[] = [];
  car2Years: number[] = [];
  car1Details: CarDetails | null = null;
  car2Details: CarDetails | null = null;
  result: any = null;
  loading = false;
  showAdvanced = false;

  loadingCar1Models = false;
  loadingCar2Models = false;
  loadingCar1Years = false;
  loadingCar2Years = false;
  loadingCar1Details = false;
  loadingCar2Details = false;
  private brandsLoaded = false;

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
    private carDataService: CarDataService
  ) {
    this.car1Form = this.fb.group({
      vin: [''],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.car2Form = this.fb.group({
      vin: [''],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required]
    });
    this.weightsForm = this.fb.group({
      performance: [33],
      value: [33],
      efficiency: [34],
      modernity: [0],
      practicality: [0]
    });
  }

  ngOnInit() {
    this.loadBrands();
    this.car1Form.get('brand')?.valueChanges.subscribe(brand => {
      if (!brand) return;

      this.car1Models = [];
      this.car1Years = [];

      this.car1Form.patchValue({ model: '', year: '' }, { emitEvent: false });
      this.loadModelsForCar1(brand);
    });

    this.car1Form.get('model')?.valueChanges.subscribe(model => {
      const brand = this.car1Form.get('brand')?.value;
      if (!brand || !model) return;

      this.car1Years = [];
      this.car1Form.patchValue({ year: '' }, { emitEvent: false });

      this.loadYearsForCar1(brand, model);
    });
    this.car1Form.get('year')?.valueChanges.subscribe(year => {
      const brand = this.car1Form.get('brand')?.value;
      const model = this.car1Form.get('model')?.value;

      if (brand && model && year) {
        this.loadCarDetailsForCar1(brand, model, year);
      }
    });
    this.car2Form.get('brand')?.valueChanges.subscribe(brand => {
      if (!brand) return;

      this.car2Models = [];
      this.car2Years = [];

      this.car2Form.patchValue({ model: '', year: '' }, { emitEvent: false });
      this.loadModelsForCar2(brand);
    });

    this.car2Form.get('model')?.valueChanges.subscribe(model => {
      const brand = this.car2Form.get('brand')?.value;
      if (!brand || !model) return;

      this.car2Years = [];
      this.car2Form.patchValue({ year: '' }, { emitEvent: false });

      this.loadYearsForCar2(brand, model);
    });
    this.car2Form.get('year')?.valueChanges.subscribe(year => {
      const brand = this.car2Form.get('brand')?.value;
      const model = this.car2Form.get('model')?.value;
      if (brand && model && year) {
        this.loadCarDetailsForCar2(brand, model, year);
      }
    });

    this.car1Form.get('vin')?.valueChanges.subscribe(vin => {
      if (vin?.length >= 17) this.onVinCar1();
    });

    this.car2Form.get('vin')?.valueChanges.subscribe(vin => {
      if (vin?.length >= 17) this.onVinCar2();
    });
  }

  loadBrands() {
    this.carDataService.getBrands().subscribe({
      next: (res) => {
        this.brands = res.brands;
        this.brandsLoaded = true;
      },
      error: (err) => console.error(err)
    });
  }

  loadModelsForCar1(brand: string) {
    this.loadingCar1Models = true;
    this.carDataService.getModels(brand).subscribe({
      next: (res) => {
        this.car1Models = res.models;
        this.loadingCar1Models = false;
      },
      error: () => this.loadingCar1Models = false
    });
  }

  loadModelsForCar2(brand: string) {
    this.loadingCar2Models = true;
    this.carDataService.getModels(brand).subscribe({
      next: (res) => {
        this.car2Models = res.models;
        this.loadingCar2Models = false;
      },
      error: () => this.loadingCar2Models = false
    });
  }

  loadYearsForCar1(brand: string, model: string) {
    this.loadingCar1Years = true;
    this.carDataService.getYears(brand, model).subscribe({
      next: (res) => {
        this.car1Years = res.years;
        this.loadingCar1Years = false;
      },
      error: () => this.loadingCar1Years = false
    });
  }

  loadYearsForCar2(brand: string, model: string) {
    this.loadingCar2Years = true;
    this.carDataService.getYears(brand, model).subscribe({
      next: (res) => {
        this.car2Years = res.years;
        this.loadingCar2Years = false;
      },
      error: () => this.loadingCar2Years = false
    });
  }

  loadCarDetailsForCar1(brand: string, model: string, year: number) {
    this.loadingCar1Details = true;
    this.carDataService.getCarDetails(brand, model, year).subscribe({
      next: (res) => {
        this.car1Details = res;
        this.loadingCar1Details = false;
      },
      error: () => this.loadingCar1Details = false
    });
  }

  loadCarDetailsForCar2(brand: string, model: string, year: number) {
    this.loadingCar2Details = true;
    this.carDataService.getCarDetails(brand, model, year).subscribe({
      next: (res) => {
        this.car2Details = res;
        this.loadingCar2Details = false;
      },
      error: () => this.loadingCar2Details = false
    });
  }

  onVinCar1() {
    const vin = this.car1Form.get('vin')?.value;
    if (!vin || vin.length < 17) return;
    if (!this.brandsLoaded) return;

    this.api.decodeVin(vin).subscribe({
      next: (res) => {

        const vinBrand = res.make?.trim() ?? '';
        const vinModel = res.model?.trim() ?? '';
        const year = Number(res.year);

        const matchedBrand =
          this.brands.find(b =>
            b.toLowerCase().trim() === vinBrand.toLowerCase().trim()
          ) || vinBrand;

        this.car1Form.patchValue({ brand: matchedBrand }, { emitEvent: false });

        this.carDataService.getModels(matchedBrand).subscribe({
          next: (modelsRes) => {
            this.car1Models = modelsRes.models;

            const matchedModel =
              this.car1Models.find(m =>
                m.toLowerCase().trim() === vinModel.toLowerCase().trim()
              ) || vinModel;

            this.car1Form.patchValue({ model: matchedModel }, { emitEvent: false });

            this.carDataService.getYears(matchedBrand, matchedModel).subscribe({
              next: (yearsRes) => {
                this.car1Years = yearsRes.years;

                this.car1Form.patchValue({ year }, { emitEvent: false });

                this.loadCarDetailsForCar1(matchedBrand, matchedModel, year);
              }
            });
          }
        });
      },
      error: (err) => console.error(err)
    });
  }

  onVinCar2() {
    const vin = this.car2Form.get('vin')?.value;
    if (!vin || vin.length < 17) return;
    if (!this.brandsLoaded) return;

    this.api.decodeVin(vin).subscribe({
      next: (res) => {

        const vinBrand = res.make?.trim() ?? '';
        const vinModel = res.model?.trim() ?? '';
        const year = Number(res.year);

        const matchedBrand =
          this.brands.find(b =>
            b.toLowerCase().trim() === vinBrand.toLowerCase().trim()
          ) || vinBrand;

        this.car2Form.patchValue({ brand: matchedBrand }, { emitEvent: false });

        this.carDataService.getModels(matchedBrand).subscribe({
          next: (modelsRes) => {
            this.car2Models = modelsRes.models;

            const matchedModel =
              this.car2Models.find(m =>
                m.toLowerCase().trim() === vinModel.toLowerCase().trim()
              ) || vinModel;

            this.car2Form.patchValue({ model: matchedModel }, { emitEvent: false });

            this.carDataService.getYears(matchedBrand, matchedModel).subscribe({
              next: (yearsRes) => {
                this.car2Years = yearsRes.years;

                this.car2Form.patchValue({ year }, { emitEvent: false });

                this.loadCarDetailsForCar2(matchedBrand, matchedModel, year);
              }
            });
          }
        });
      },
      error: (err) => console.error(err)
    });
  }

  swapCars() {
    const c1 = this.car1Form.value;
    const c2 = this.car2Form.value;
    const d1 = this.car1Details;
    const d2 = this.car2Details;
    this.car1Form.setValue(c2);
    this.car2Form.setValue(c1);
    this.car1Details = d2;
    this.car2Details = d1;
  }

  submit() {
    if (this.car1Form.invalid || this.car2Form.invalid || !this.car1Details || !this.car2Details) return;
    this.loading = true;
    this.result = null;
    const weights = this.showAdvanced ? this.weightsForm.value : null;
    this.api.compare(this.car1Details, this.car2Details, weights).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  resetComparison() {
    this.car1Form.reset();
    this.car2Form.reset();
    this.car1Models = [];
    this.car2Models = [];
    this.car1Years = [];
    this.car2Years = [];
    this.car1Details = null;
    this.car2Details = null;
    this.result = null;
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'excellent';
    if (score >= 50) return 'good';
    if (score >= 30) return 'average';
    return 'poor';
  }

  getWinnerClass(carNumber: number): string {
    if (!this.result) return '';
    if (this.result.winner === carNumber) return 'winner';
    if (this.result.winner === 0) return 'tie';
    return '';
  }
  getScoreKeys(scores: any): string[] {
    return scores ? Object.keys(scores) : [];
  }
  getScoreValue(scores: any, key: string): number {
    return scores ? scores[key] : 0;
  }
}