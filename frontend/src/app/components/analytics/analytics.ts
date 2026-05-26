import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../common/header/header';
import { AnalyticsService, AnalyticsFilters } from '../../services/analytics.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class Analytics implements OnInit {
  @ViewChild('brandsChart') brandsRef!: ElementRef;
  @ViewChild('fuelChart') fuelRef!: ElementRef;
  @ViewChild('transmissionChart') transmissionRef!: ElementRef;
  @ViewChild('mileageChart') mileageRef!: ElementRef;
  @ViewChild('clusterChart') clusterRef!: ElementRef;

  private charts: Map<string, Chart> = new Map();

  loading = true;
  brands: string[] = [];
  allData: any = {};

  filters: AnalyticsFilters = {
    brand: 'all',
    year_min: 1998,
    year_max: 2020,
    price_min: undefined,
    price_max: undefined
  };

  priceRanges = [
    { label: 'Any', min: undefined, max: undefined },
    { label: '£0 – £5,000', min: 0, max: 5000 },
    { label: '£5,000 – £15,000', min: 5000, max: 15000 },
    { label: '£15,000 – £30,000', min: 15000, max: 30000 },
    { label: '£30,000+', min: 30000, max: undefined },
  ];

  selectedPriceRange = 0;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    Promise.all([
      this.analytics.getBrands(this.filters).toPromise(),
      this.analytics.getFuelTypes(this.filters).toPromise(),
      this.analytics.getTransmissions(this.filters).toPromise(),
      this.analytics.getMileage(this.filters).toPromise(),
      this.analytics.getClusters(this.filters).toPromise(),
    ]).then(([brands, fuel, transmission, mileage, clusters]) => {
      this.allData = { brands, fuel, transmission, mileage, clusters: clusters!.cluster_counts };
      if (!this.brands.length) this.brands = ['all', ...Object.keys(brands!)];
      this.loading = false;
      setTimeout(() => this.renderAll(), 100);
    });
  }

  onFilterChange() {
    const range = this.priceRanges[this.selectedPriceRange];
    this.filters.price_min = range.min;
    this.filters.price_max = range.max;
    this.loadAll();
  }

renderAll() {
  this.makeBar('brandsChart', this.brandsRef, this.allData.brands, 'Cars by Brand', '#4a9eff');
  this.makeDoughnut('fuelChart', this.fuelRef, this.allData.fuel, 'Fuel Types');
  this.makeDoughnut('transmissionChart', this.transmissionRef, this.allData.transmission, 'Transmission');
  this.makeBar('mileageChart', this.mileageRef, this.allData.mileage, 'Mileage Groups', '#7b61ff');

  const clusterLabels: Record<string, string> = {
    '0': 'Nearly New / Premium',
    '1': 'High Mileage / Budget',
    '2': 'Mid-Range / Average'
  };
  const renamedClusters: Record<string, number> = {};
  for (const key of Object.keys(this.allData.clusters)) {
    const label = clusterLabels[key] ?? `Cluster ${key}`;
    renamedClusters[label] = this.allData.clusters[key];
  }
  this.makeBar('clusterChart', this.clusterRef, renamedClusters, 'Car Clusters', '#34d399');
}
  makeBar(id: string, ref: ElementRef, data: Record<string, number>, label: string, color: string) {
    if (this.charts.has(id)) this.charts.get(id)!.destroy();
    const chart = new Chart(ref.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{ label, data: Object.values(data), backgroundColor: color, borderRadius: 8 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${(ctx.parsed?.y ?? 0).toLocaleString()} cars` } }
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
    this.charts.set(id, chart);
  }

  makeDoughnut(id: string, ref: ElementRef, data: Record<string, number>, label: string) {
    if (this.charts.has(id)) this.charts.get(id)!.destroy();
    const chart = new Chart(ref.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label,
          data: Object.values(data),
          backgroundColor: ['#4a9eff', '#7b61ff', '#34d399', '#f59e0b'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.8,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.7)', padding: 16, boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });
    this.charts.set(id, chart);
  }
}