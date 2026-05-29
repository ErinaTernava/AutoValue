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

  constructor(
    private fb: FormBuilder,
    private api: Endpoints,
    private carDataService: CarDataService
  ) {
    this.car1Form = this.fb.group({
      vin: [],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required]
    });
    
    this.car2Form = this.fb.group({
      vin: [],
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
    
    this.car1Form.get('model')?.valueChanges.subscribe(model => {
      const brand = this.car1Form.get('brand')?.value;
      if (brand && model) {
        this.loadYearsForCar1(brand, model);
        this.car1Form.patchValue({ year: '' });
        this.car1Details = null;
      }
    });
    
  
    this.car1Form.get('year')?.valueChanges.subscribe(year => {
      const brand = this.car1Form.get('brand')?.value;
      const model = this.car1Form.get('model')?.value;
      if (brand && model && year) {
        this.loadCarDetailsForCar1(brand, model, year);
      }
    });
    
    this.car2Form.get('model')?.valueChanges.subscribe(model => {
      const brand = this.car2Form.get('brand')?.value;
      if (brand && model) {
        this.loadYearsForCar2(brand, model);
        this.car2Form.patchValue({ year: '' });
        this.car2Details = null;
      }
    });
    
   
    this.car2Form.get('year')?.valueChanges.subscribe(year => {
      const brand = this.car2Form.get('brand')?.value;
      const model = this.car2Form.get('model')?.value;
      if (brand && model && year) {
        this.loadCarDetailsForCar2(brand, model, year);
      }
    });

    this.car1Form.get('vin')?.valueChanges.subscribe(vin => {
      if (vin?.length > 10) this.onVinCar1();
    });

    this.car2Form.get('vin')?.valueChanges.subscribe(vin => {
      if (vin?.length > 10) this.onVinCar2();
    });
  }

  loadBrands() {
    this.carDataService.getBrands().subscribe({
      next: (res) => {
        this.brands = res.brands;
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }

  loadModelsForCar1(brand: string) {
    this.loadingCar1Models = true;
    this.carDataService.getModels(brand).subscribe({
      next: (res) => {
        this.car1Models = res.models;
        this.loadingCar1Models = false;
      },
      error: (err) => {
        console.error('Error loading models:', err);
        this.loadingCar1Models = false;
      }
    });
  }

  loadModelsForCar2(brand: string) {
    this.loadingCar2Models = true;
    this.carDataService.getModels(brand).subscribe({
      next: (res) => {
        this.car2Models = res.models;
        this.loadingCar2Models = false;
      },
      error: (err) => {
        console.error('Error loading models:', err);
        this.loadingCar2Models = false;
      }
    });
  }

  loadYearsForCar1(brand: string, model: string) {
    this.loadingCar1Years = true;
    this.carDataService.getYears(brand, model).subscribe({
      next: (res) => {
        this.car1Years = res.years;
        this.loadingCar1Years = false;
      },
      error: (err) => {
        console.error('Error loading years:', err);
        this.loadingCar1Years = false;
      }
    });
  }

  loadYearsForCar2(brand: string, model: string) {
    this.loadingCar2Years = true;
    this.carDataService.getYears(brand, model).subscribe({
      next: (res) => {
        this.car2Years = res.years;
        this.loadingCar2Years = false;
      },
      error: (err) => {
        console.error('Error loading years:', err);
        this.loadingCar2Years = false;
      }
    });
  }

  loadCarDetailsForCar1(brand: string, model: string, year: number) {
    this.loadingCar1Details = true;
    this.carDataService.getCarDetails(brand, model, year).subscribe({
      next: (res) => {
        this.car1Details = res;
        this.loadingCar1Details = false;
      },
      error: (err) => {
        console.error('Error loading car details:', err);
        this.loadingCar1Details = false;
      }
    });
  }

  loadCarDetailsForCar2(brand: string, model: string, year: number) {
    this.loadingCar2Details = true;
    this.carDataService.getCarDetails(brand, model, year).subscribe({
      next: (res) => {
        this.car2Details = res;
        this.loadingCar2Details = false;
      },
      error: (err) => {
        console.error('Error loading car details:', err);
        this.loadingCar2Details = false;
      }
    });
  }

  swapCars() {
    const car1Value = this.car1Form.value;
    const car2Value = this.car2Form.value;
    const car1Details = this.car1Details;
    const car2Details = this.car2Details;
    
    this.car1Form.setValue(car2Value);
    this.car2Form.setValue(car1Value);
    this.car1Details = car2Details;
    this.car2Details = car1Details;
  }

  submit() {
    if (this.car1Form.invalid || this.car2Form.invalid || !this.car1Details || !this.car2Details) {
      return;
    }
    
    this.loading = true;
    this.result = null;
    
    const weights = this.showAdvanced ? this.weightsForm.value : null;
    
    this.api.compare(this.car1Details, this.car2Details, weights).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error comparing cars:', err);
        this.loading = false;
      }
    });
  }

  resetComparison() {
    this.car1Form.reset();
    this.car2Form.reset();
    this.car1Details = null;
    this.car2Details = null;
    this.result = null;
    this.weightsForm.setValue({
      performance: 33,
      value: 33,
      efficiency: 34,
      modernity: 0,
      practicality: 0
    });
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
  onVinCar1() {
    const vin = this.car1Form.get('vin')?.value;
    if (!vin || vin.length < 17) return;

    this.api.decodeVin(vin).subscribe({
      next: (res) => {
        const make = res.make?.toLowerCase().trim();
        const model = res.model?.toLowerCase().trim();
        const year = Number(res.year);

        this.car1Form.patchValue(
          {
            brand: make
          },
          { emitEvent: false }
        );
        this.loadingCar1Models = true;

        this.carDataService.getModels(make).subscribe({
          next: (modelsRes) => {
            this.car1Models = modelsRes.models;
            this.loadingCar1Models = false;
            const matchedModel = this.car1Models.find(
              m => m.toLowerCase().trim() === model
            );

            if (!matchedModel) {
              console.log('MODEL NOT FOUND');
              console.log('VIN model:', model);
              console.log('Available models:', this.car1Models);
              return;
            }

            this.car1Form.patchValue(
              {
                model: matchedModel
              },
              { emitEvent: false }
            );
            this.loadingCar1Years = true;

            this.carDataService.getYears(make, matchedModel).subscribe({
              next: (yearsRes) => {
                this.car1Years = yearsRes.years;
                this.loadingCar1Years = false;

                this.car1Form.patchValue(
                  {
                    year: year
                  },
                  { emitEvent: false }
                );

                this.loadCarDetailsForCar1(
                  make,
                  matchedModel,
                  year
                );
              },
              error: (err) => {
                console.error(err);
                this.loadingCar1Years = false;
              }
            });
          },
          error: (err) => {
            console.error(err);
            this.loadingCar1Models = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onVinCar2() {
    const vin = this.car2Form.get('vin')?.value;
    if (!vin || vin.length < 17) return;

    this.api.decodeVin(vin).subscribe({
      next: (res) => {
        const make = res.make?.toLowerCase().trim();
        const model = res.model?.toLowerCase().trim();
        const year = Number(res.year);

        this.car2Form.patchValue(
          {
            brand: make
          },
          { emitEvent: false }
        );
        this.loadingCar2Models = true;
        this.carDataService.getModels(make).subscribe({
          next: (modelsRes) => {
            this.car2Models = modelsRes.models;
            this.loadingCar2Models = false;
            const matchedModel = this.car2Models.find(
              m => m.toLowerCase().trim() === model
            );

            if (!matchedModel) {
              console.log('MODEL NOT FOUND');
              console.log('VIN model:', model);
              console.log('Available models:', this.car2Models);
              return;
            }

            this.car2Form.patchValue(
              {
                model: matchedModel
              },
              { emitEvent: false }
            );
            this.loadingCar2Years = true;

            this.carDataService.getYears(make, matchedModel).subscribe({
              next: (yearsRes) => {
                this.car2Years = yearsRes.years;
                this.loadingCar2Years = false;
                this.car2Form.patchValue(
                  {
                    year: year
                  },
                  { emitEvent: false }
                );

                this.loadCarDetailsForCar2(
                  make,
                  matchedModel,
                  year
                );
              },
              error: (err) => {
                console.error(err);
                this.loadingCar2Years = false;
              }
            });
          },
          error: (err) => {
            console.error(err);
            this.loadingCar2Models = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}