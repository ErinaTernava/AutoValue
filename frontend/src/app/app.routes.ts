import { Routes } from '@angular/router';
import { Index } from './components/index/index';
import { PriceSuggester } from './components/price-suggester/price-suggester';
import { PriceEvaluator } from './components/price-evaluator/price-evaluator';
import { CarComparison } from './components/car-comparison/car-comparison';



export const routes: Routes = [
  {
    path: 'price-evaluator',
    component: PriceEvaluator,
  },
  {
    path: 'price-suggester',
    component: PriceSuggester,
  },
  {
    path: 'car-comparison',
    component: CarComparison,
  },
  {
    path: '',
    component: Index,
  },
];
