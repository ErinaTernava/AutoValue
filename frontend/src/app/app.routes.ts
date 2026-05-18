import { Routes } from '@angular/router';
import { Index } from './components/index/index';
import { PriceSuggester } from './components/price-suggester/price-suggester';

export const routes: Routes = [
  {
    path: 'price-suggester',
    component: PriceSuggester,
  },
  {
    path: '',
    component: Index,
  },
];
