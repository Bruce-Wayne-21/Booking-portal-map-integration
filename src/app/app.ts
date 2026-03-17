import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  computed,
  signal,
  Injectable,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// ---------------------------------------------------------------------------
// INTERFACES
// ---------------------------------------------------------------------------
interface Facility {
  id: number;
  name: string;
  description: string;
  category: 'Gym' | 'Conference Hall' | 'Swimming Pool' | 'Tennis Court';
  imageUrl: string;
  pricePerHour: number;
  isAvailable: boolean;
  coordinates: [number, number];
}

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  facilityName: string;
  facilityEmoji: string;
}

// ---------------------------------------------------------------------------
// HARDCODED MAPBOX TOKEN
// ---------------------------------------------------------------------------
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FqaS0xMDIxIiwiYSI6ImNtbXVpaThiNjFwaHoycW9qOWF1dXhlb2cifQ.6wvYWcRrJ8O7KQ2vaWSUHg';

// ---------------------------------------------------------------------------
// CATEGORY CONFIG
// ---------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<
  Facility['category'],
  { color: string; bg: string; emoji: string }
> = {
  Gym: { color: '#6366f1', bg: '#eef2ff', emoji: '🏋️' },
  'Conference Hall': { color: '#0ea5e9', bg: '#e0f2fe', emoji: '🏛️' },
  'Swimming Pool': { color: '#10b981', bg: '#d1fae5', emoji: '🏊' },
  'Tennis Court': { color: '#f59e0b', bg: '#fef3c7', emoji: '🎾' },
};

// ---------------------------------------------------------------------------
// FACILITY SERVICE — Jaffna, Sri Lanka
// ---------------------------------------------------------------------------
@Injectable({ providedIn: 'root' })
class FacilityService {
  // Default user location — Jaffna Fort area
  userLocation: [number, number] = [80.025, 9.661];

  private readonly mockFacilities: Facility[] = [
    // Gyms — around Jaffna
    { id: 1, name: 'Nallur PowerHouse Gym', description: 'Modern gym with free weights, cardio machines and personal trainers near Nallur Kandaswamy Temple.', category: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop', pricePerHour: 15, isAvailable: true, coordinates: [80.0245, 9.6695] },
    { id: 2, name: 'Jaffna Iron Core', description: 'Hardcore bodybuilding gym in the heart of Jaffna town.', category: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=400&auto=format&fit=crop', pricePerHour: 10, isAvailable: true, coordinates: [80.0170, 9.6620] },
    { id: 3, name: 'Chunnakam Fitness Hub', description: 'Family-friendly fitness center with yoga, pilates and swimming classes.', category: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop', pricePerHour: 20, isAvailable: false, coordinates: [80.0520, 9.7310] },
    { id: 4, name: 'KKS Road FitZone', description: 'Spacious two-floor gym with air-conditioned cardio section.', category: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop', pricePerHour: 12, isAvailable: true, coordinates: [80.0100, 9.6550] },
    { id: 5, name: 'Point Pedro Athletics', description: 'HIIT and CrossFit focused gym at the northernmost tip of the island.', category: 'Gym', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop', pricePerHour: 18, isAvailable: true, coordinates: [80.2290, 9.8310] },
    // Conference Halls
    { id: 6, name: 'Jaffna Public Library Hall', description: 'Historic conference space inside the iconic Jaffna Public Library.', category: 'Conference Hall', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop', pricePerHour: 150, isAvailable: true, coordinates: [80.0240, 9.6620] },
    { id: 7, name: 'Tilko Grand Ballroom', description: 'Elegant event hall at the Tilko Jaffna City Hotel with full AV setup.', category: 'Conference Hall', imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=400&auto=format&fit=crop', pricePerHour: 250, isAvailable: false, coordinates: [80.0210, 9.6580] },
    { id: 8, name: 'YMCA Jaffna Center', description: 'Community hall perfect for workshops and seminars.', category: 'Conference Hall', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=400&auto=format&fit=crop', pricePerHour: 60, isAvailable: true, coordinates: [80.0200, 9.6640] },
    { id: 9, name: 'Subhas Hotel Boardroom', description: 'Modern boardroom with video conferencing in central Jaffna.', category: 'Conference Hall', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop', pricePerHour: 50, isAvailable: true, coordinates: [80.0265, 9.6610] },
    { id: 10, name: 'Heritage Grand Hall', description: 'Luxurious heritage banquet hall near Jaffna Fort.', category: 'Conference Hall', imageUrl: 'https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=400&auto=format&fit=crop', pricePerHour: 180, isAvailable: true, coordinates: [80.0135, 9.6560] },
    // Swimming Pools
    { id: 11, name: 'Jaffna University Pool', description: 'Olympic-sized pool at the University of Jaffna sports complex.', category: 'Swimming Pool', imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34bf9150f01?q=80&w=400&auto=format&fit=crop', pricePerHour: 25, isAvailable: true, coordinates: [80.0230, 9.6840] },
    { id: 12, name: 'Casuarina Beach Club', description: 'Beachside pool with ocean views at Casuarina Beach, Karainagar.', category: 'Swimming Pool', imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=400&auto=format&fit=crop', pricePerHour: 30, isAvailable: false, coordinates: [79.9010, 9.7350] },
    { id: 13, name: 'Manipay Swim Center', description: 'Family pool with kids section in the Manipay suburb.', category: 'Swimming Pool', imageUrl: 'https://images.unsplash.com/photo-1530546171985-780c1df07d12?q=80&w=400&auto=format&fit=crop', pricePerHour: 20, isAvailable: true, coordinates: [80.0470, 9.7160] },
    { id: 14, name: 'Fox Resorts Infinity Pool', description: 'Rooftop infinity pool overlooking the Jaffna Lagoon.', category: 'Swimming Pool', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400&auto=format&fit=crop', pricePerHour: 60, isAvailable: true, coordinates: [80.0180, 9.6700] },
    { id: 15, name: 'Kokuvil Public Pool', description: 'Municipal pool open for public booking on weekends.', category: 'Swimming Pool', imageUrl: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=400&auto=format&fit=crop', pricePerHour: 15, isAvailable: true, coordinates: [80.0395, 9.6910] },
    // Tennis Courts
    { id: 16, name: 'Jaffna Tennis Club', description: 'Historic clay courts maintained since colonial times near the Fort.', category: 'Tennis Court', imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop', pricePerHour: 25, isAvailable: true, coordinates: [80.0155, 9.6590] },
    { id: 17, name: 'Nallur Sports Complex Courts', description: 'Well-lit hard courts open until 10 PM nightly.', category: 'Tennis Court', imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?q=80&w=400&auto=format&fit=crop', pricePerHour: 30, isAvailable: true, coordinates: [80.0270, 9.6720] },
    { id: 18, name: 'St. Johns College Courts', description: 'Exclusive grass courts on the school grounds, available for guest play.', category: 'Tennis Court', imageUrl: 'https://images.unsplash.com/photo-1530915365347-2cc5d20fb669?q=80&w=400&auto=format&fit=crop', pricePerHour: 35, isAvailable: false, coordinates: [80.0190, 9.6660] },
    { id: 19, name: 'Chankanai Tennis Academy', description: 'Professional coaching courts with ball machines and floodlights.', category: 'Tennis Court', imageUrl: 'https://images.unsplash.com/photo-1549740059-d3e70ffc610d?q=80&w=400&auto=format&fit=crop', pricePerHour: 20, isAvailable: true, coordinates: [80.0730, 9.7470] },
    { id: 20, name: 'Pannai Sports Ground', description: 'Community hard courts adjacent to the Pannai cricket pitch.', category: 'Tennis Court', imageUrl: 'https://images.unsplash.com/photo-1560012057-4372e14c5085?q=80&w=400&auto=format&fit=crop', pricePerHour: 22, isAvailable: true, coordinates: [80.0350, 9.6770] },
  ];

  getFacilities(): Facility[] {
    return this.mockFacilities;
  }

  calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-root',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
  styles: [`
    @keyframes pulse-ring {
      0%   { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes route-slide-up {
      0%   { transform: translate(-50%, 30px); opacity: 0; }
      100% { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes route-glow {
      0%, 100% { box-shadow: 0 4px 30px rgba(99,102,241,0.25); }
      50%      { box-shadow: 0 4px 40px rgba(99,102,241,0.5); }
    }
    .route-popup-enter {
      animation: route-slide-up .4s cubic-bezier(.22,1,.36,1) forwards, route-glow 3s ease-in-out infinite .4s;
    }
  `],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">

      <!-- ── Header ── -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 shrink-0">
            <div class="bg-indigo-600 p-1.5 rounded-lg"><svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
            <span class="text-xl font-bold text-slate-800 tracking-tight hidden md:block">BookIt Jaffna</span>
          </div>
          <div class="flex-1 max-w-2xl flex items-center gap-2">
            <div class="relative flex-1">
              <label for="facility-search" class="sr-only">Search facilities</label>
              <input id="facility-search" type="search" [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" placeholder="Search facilities..."
                     class="w-full pl-9 pr-4 py-2 rounded-full border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-shadow">
              <svg class="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <label for="category-select" class="sr-only">Category</label>
            <select id="category-select" [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" class="py-2 px-3 rounded-full border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white cursor-pointer hidden sm:block">
              <option value="All">All Categories</option>
              <option value="Gym">Gyms</option>
              <option value="Conference Hall">Conference Halls</option>
              <option value="Swimming Pool">Swimming Pools</option>
              <option value="Tennis Court">Tennis Courts</option>
            </select>
          </div>
          <div class="flex items-center bg-slate-100 p-1 rounded-xl shrink-0" role="group" aria-label="View mode">
            <button (click)="setViewMode('list')" [class.bg-white]="viewMode() === 'list'" [class.shadow-sm]="viewMode() === 'list'" [attr.aria-pressed]="viewMode() === 'list'" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>List
            </button>
            <button (click)="setViewMode('map')" [class.bg-white]="viewMode() === 'map'" [class.shadow-sm]="viewMode() === 'map'" [attr.aria-pressed]="viewMode() === 'map'" class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 transition-all flex items-center gap-1.5">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>Map
            </button>
          </div>
        </div>
      </header>

      <!-- ── Main ── -->
      <main class="relative h-[calc(100vh-64px)] overflow-hidden">

        <!-- ═══ LIST VIEW ═══ -->
        @if (viewMode() === 'list' && !selectedFacility()) {
          <div class="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div class="max-w-7xl mx-auto">
              <div class="mb-6 bg-indigo-900 rounded-3xl overflow-hidden relative shadow-xl">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" alt="" role="presentation" class="absolute inset-0 w-full h-full object-cover opacity-20">
                <div class="relative z-10 p-8 md:p-12">
                  <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-3">Explore Jaffna Facilities</h2>
                  <p class="text-indigo-100 text-base md:text-lg max-w-2xl">Book premium gyms, halls, pools &amp; courts across the Jaffna peninsula.</p>
                </div>
              </div>
              <div class="mb-5 bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center gap-4 shadow-sm">
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700"><svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Max: <strong class="text-indigo-600">\${{maxPrice}}/hr</strong></div>
                <input type="range" [(ngModel)]="maxPrice" (ngModelChange)="onFilterChange()" min="10" max="250" step="5" class="flex-1 min-w-[120px] accent-indigo-600" aria-label="Max price">
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700"><svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>Within: <strong class="text-indigo-600">{{radiusKm}} km</strong></div>
                <input type="range" [(ngModel)]="radiusKm" (ngModelChange)="onFilterChange()" min="1" max="30" step="1" class="flex-1 min-w-[120px] accent-indigo-600" aria-label="Radius">
                <button (click)="clearFilters()" class="text-xs text-slate-500 hover:text-indigo-600 underline transition-colors">Reset</button>
              </div>
              <p class="text-sm text-slate-500 mb-4">Showing <strong class="text-slate-700">{{filteredFacilities().length}}</strong> of {{facilities().length}} facilities</p>
              @if (filteredFacilities().length === 0) {
                <div class="text-center py-20 bg-white rounded-3xl border border-slate-200"><svg class="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><h3 class="text-xl font-semibold text-slate-700">No facilities found</h3><p class="text-slate-500 mt-2">Adjust your filters.</p><button (click)="clearFilters()" class="mt-5 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium hover:bg-indigo-100 transition-colors text-sm">Clear Filters</button></div>
              }
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                @for (facility of filteredFacilities(); track facility.id) {
                  <article class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 group flex flex-col cursor-pointer" (click)="openDetails(facility)" (keydown.enter)="openDetails(facility)" tabindex="0" role="button" [attr.aria-label]="'View ' + facility.name">
                    <div class="relative h-44 overflow-hidden">
                      <img [src]="facility.imageUrl" [alt]="facility.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                      <div class="absolute top-3 left-3"><span class="text-xs font-bold px-2.5 py-1 rounded-full shadow-sm" [style.background]="getCategoryConfig(facility.category).bg" [style.color]="getCategoryConfig(facility.category).color">{{getCategoryConfig(facility.category).emoji}} {{facility.category}}</span></div>
                      <div class="absolute top-3 right-3">@if (facility.isAvailable) {<span class="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" aria-hidden="true"></span>Available</span>} @else {<span class="bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">Booked</span>}</div>
                    </div>
                    <div class="p-4 flex flex-col flex-1">
                      <h3 class="font-bold text-base text-slate-800 mb-1 line-clamp-1">{{facility.name}}</h3>
                      <div class="flex items-center gap-1 text-slate-500 text-xs mb-3"><svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>{{getDistance(facility)}} km away</div>
                      <div class="mt-auto flex items-center justify-between">
                        <div class="text-indigo-600 font-extrabold text-lg">\${{facility.pricePerHour}}<span class="text-xs font-normal text-slate-500">/hr</span></div>
                        <button (click)="flyToFacility($event, facility)" class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1" aria-label="Show on map"><svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>Map</button>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </div>
          </div>
        }

        <!-- ═══ MAP VIEW ═══ -->
        <div [class.opacity-100]="viewMode() === 'map' && !selectedFacility()"
             [class.z-10]="viewMode() === 'map' && !selectedFacility()"
             [class.relative]="viewMode() === 'map' && !selectedFacility()"
             [class.opacity-0]="viewMode() !== 'map' || !!selectedFacility()"
             [class.-z-50]="viewMode() !== 'map' || !!selectedFacility()"
             [class.pointer-events-none]="viewMode() !== 'map' || !!selectedFacility()"
             [class.absolute]="viewMode() !== 'map' || !!selectedFacility()"
             [class.inset-0]="viewMode() !== 'map' || !!selectedFacility()"
             class="h-full w-full transition-opacity duration-300" aria-hidden="true">
          <div id="main-map" class="absolute inset-0 w-full h-full"></div>

          @if (isMapboxLoaded()) {
            <!-- Left controls -->
            <div class="absolute top-3 left-3 z-20 flex flex-col gap-2">
              <div class="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-2.5">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Filter</p>
                <div class="flex flex-col gap-1">@for (cat of categoryFilters; track cat.value) {<button (click)="toggleCategoryFilter(cat.value)" [style.background]="activeCategoryFilters().includes(cat.value) ? cat.bg : 'transparent'" [style.color]="activeCategoryFilters().includes(cat.value) ? cat.color : '#64748b'" [style.border-color]="activeCategoryFilters().includes(cat.value) ? cat.color : 'transparent'" class="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:bg-slate-50 whitespace-nowrap" [attr.aria-pressed]="activeCategoryFilters().includes(cat.value)">{{cat.emoji}} {{cat.label}}</button>}</div>
              </div>
              <div class="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-2.5"><p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Radius</p><div class="flex items-center gap-2 px-1"><input type="range" [(ngModel)]="radiusKm" (ngModelChange)="onMapFilterChange()" min="1" max="30" step="1" class="w-24 accent-indigo-600" aria-label="Radius"><span class="text-xs font-bold text-indigo-600 w-12">{{radiusKm}} km</span></div></div>
              <div class="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-slate-200 p-2.5"><p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Max Price</p><div class="flex items-center gap-2 px-1"><input type="range" [(ngModel)]="maxPrice" (ngModelChange)="onMapFilterChange()" min="10" max="250" step="5" class="w-24 accent-indigo-600" aria-label="Max price"><span class="text-xs font-bold text-indigo-600 w-16">\${{maxPrice}}/hr</span></div></div>
            </div>

            <!-- Right: style + 3D -->
            <div class="absolute top-3 right-3 bg-white/95 backdrop-blur p-2 rounded-2xl shadow-lg border border-slate-200 z-20">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Style</p>
              <div class="flex flex-col gap-1">@for (style of mapStyles; track style.id) {<button (click)="changeMapStyle(style.id)" [class.bg-indigo-50]="currentMapStyle() === style.id" [class.text-indigo-700]="currentMapStyle() === style.id" [class.text-slate-600]="currentMapStyle() !== style.id" class="text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors">{{style.name}}</button>}</div>
              <hr class="my-2 border-slate-200">
              <button (click)="toggle3DView()" [class.bg-indigo-600]="is3DActive()" [class.text-white]="is3DActive()" [class.bg-slate-100]="!is3DActive()" [class.text-slate-600]="!is3DActive()" [disabled]="!['streets-v12','outdoors-v12'].includes(currentMapStyle())" class="w-full px-2.5 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 justify-center">🏢 3D Buildings</button>
            </div>

            <!-- STUNNING ROUTE POPUP -->
            @if (routeInfo()) {
              <div class="route-popup-enter absolute bottom-20 left-1/2 z-30 bg-gradient-to-br from-white via-white to-indigo-50 rounded-3xl border border-indigo-100 px-6 py-4 flex items-center gap-5 w-[340px] max-w-[90vw]"
                   style="transform:translateX(-50%)">
                <div class="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-lg">{{routeInfo()!.facilityEmoji}}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-indigo-500 mb-0.5 uppercase tracking-wide">Route to</p>
                  <p class="text-sm font-bold text-slate-800 truncate">{{routeInfo()!.facilityName}}</p>
                  <div class="flex items-center gap-3 mt-1.5">
                    <span class="flex items-center gap-1 text-sm font-bold text-slate-700"><svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>{{routeInfo()!.distanceKm}} km</span>
                    <span class="w-px h-4 bg-slate-200"></span>
                    <span class="flex items-center gap-1 text-sm font-bold text-slate-700"><svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{{routeInfo()!.durationMin}} min</span>
                  </div>
                </div>
                <button (click)="clearRoute()" class="shrink-0 p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all" aria-label="Clear route"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
            }

            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-xs text-slate-500 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 shadow-sm">{{filteredFacilities().length}} facilities in Jaffna</div>
          }
        </div>

        <!-- ═══ DETAILS VIEW ═══ -->
        @if (selectedFacility()) {
          <div class="absolute inset-0 bg-white z-30 overflow-y-auto">
            <div class="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
              <button (click)="closeDetails()" class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-sm"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Back</button>
              <div class="text-base font-bold text-slate-800 truncate max-w-[200px]">{{selectedFacility()?.name}}</div>
              <div class="w-20" aria-hidden="true"></div>
            </div>
            <div class="max-w-5xl mx-auto p-4 md:p-8">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-5">
                  <div class="rounded-3xl overflow-hidden shadow-md h-72 md:h-[360px] relative"><img [src]="selectedFacility()?.imageUrl" [alt]="selectedFacility()?.name" class="w-full h-full object-cover"><div class="absolute top-4 left-4"><span class="font-bold px-3 py-1.5 rounded-full shadow-sm text-sm" [style.background]="getCategoryConfig(selectedFacility()!.category).bg" [style.color]="getCategoryConfig(selectedFacility()!.category).color">{{getCategoryConfig(selectedFacility()!.category).emoji}} {{selectedFacility()?.category}}</span></div></div>
                  <div><h2 class="text-2xl font-extrabold text-slate-900 mb-2">{{selectedFacility()?.name}}</h2><div class="flex flex-wrap items-center gap-3 text-slate-500 text-sm mb-5"><span class="flex items-center gap-1"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>{{getDistance(selectedFacility()!)}} km</span><span aria-hidden="true">•</span><span [class.text-emerald-600]="selectedFacility()?.isAvailable" [class.text-red-500]="!selectedFacility()?.isAvailable" class="font-semibold">{{selectedFacility()?.isAvailable ? 'Available' : 'Booked'}}</span>@if (detailRouteInfo()) {<span aria-hidden="true">•</span><span class="text-indigo-600 font-semibold">~{{detailRouteInfo()!.durationMin}} min drive</span>}</div><h3 class="text-lg font-bold text-slate-800 mb-2">About</h3><p class="text-slate-600 leading-relaxed">{{selectedFacility()?.description}}</p></div>
                </div>
                <div class="space-y-4">
                  <div class="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <div class="text-3xl font-extrabold text-indigo-600 mb-0.5">\${{selectedFacility()?.pricePerHour}}</div><div class="text-slate-500 text-sm mb-5">per hour</div>
                    <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm" [disabled]="!selectedFacility()?.isAvailable">{{selectedFacility()?.isAvailable ? 'Book Now' : 'Join Waitlist'}}</button>
                    <hr class="my-4 border-slate-200">
                    <button (click)="getDirectionsForDetail()" [disabled]="isLoadingRoute()" class="w-full bg-white border-2 border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-2">@if (isLoadingRoute()) {<svg class="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Getting route...} @else {<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>{{detailRouteInfo() ? detailRouteInfo()!.distanceKm + ' km · ' + detailRouteInfo()!.durationMin + ' min' : 'Get Directions'}}}</button>
                    <button (click)="showLocalizedMap()" class="w-full bg-white border-2 border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>{{showMiniMap() ? 'Hide Map' : 'Venue Map'}}</button>
                  </div>
                  @if (showMiniMap()) {<div class="rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-56 relative bg-slate-100"><div id="mini-map" class="absolute inset-0 w-full h-full"></div></div>}
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class App implements OnInit, AfterViewInit {
  private facilityService = inject(FacilityService);
  private cdr = inject(ChangeDetectorRef);

  facilities = signal<Facility[]>([]);
  searchTerm = '';
  selectedCategory = 'All';
  maxPrice = 250;
  radiusKm = 30;
  viewMode = signal<'list' | 'map'>('map');
  selectedFacility = signal<Facility | null>(null);
  activeCategoryFilters = signal<string[]>(['Gym', 'Conference Hall', 'Swimming Pool', 'Tennis Court']);

  filteredFacilities = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const cat = this.selectedCategory;
    const max = this.maxPrice;
    const radius = this.radiusKm;
    const active = this.activeCategoryFilters();
    return this.facilities().filter((f) => {
      return (f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term))
        && (cat === 'All' || f.category === cat)
        && f.pricePerHour <= max
        && this.facilityService.calculateDistance(this.facilityService.userLocation, f.coordinates) <= radius
        && active.includes(f.category);
    });
  });

  tempToken = '';
  isTokenProvided = signal(true);
  isMapboxLoaded = signal(false);
  mapInstance: unknown = null;
  miniMapInstance: unknown = null;
  markers: unknown[] = [];
  currentMapStyle = signal('streets-v12');
  showMiniMap = signal(false);
  routeInfo = signal<RouteInfo | null>(null);
  detailRouteInfo = signal<RouteInfo | null>(null);
  isLoadingRoute = signal(false);
  is3DActive = signal(false);
  private pendingRouteGeometry: [number, number][] | null = null;

  readonly mapStyles = [
    { id: 'streets-v12', name: '🗺 Streets' },
    { id: 'satellite-streets-v12', name: '🛰 Satellite' },
    { id: 'light-v11', name: '☀️ Light' },
    { id: 'dark-v11', name: '🌙 Dark' },
    { id: 'outdoors-v12', name: '🏔 Outdoors' },
  ];
  readonly categoryFilters = [
    { value: 'Gym', label: 'Gyms', emoji: '🏋️', color: '#6366f1', bg: '#eef2ff' },
    { value: 'Conference Hall', label: 'Halls', emoji: '🏛️', color: '#0ea5e9', bg: '#e0f2fe' },
    { value: 'Swimming Pool', label: 'Pools', emoji: '🏊', color: '#10b981', bg: '#d1fae5' },
    { value: 'Tennis Court', label: 'Tennis', emoji: '🎾', color: '#f59e0b', bg: '#fef3c7' },
  ];

  ngOnInit() { this.facilities.set(this.facilityService.getFacilities()); }

  ngAfterViewInit() { this.loadMapboxScripts(); }

  getDistance(f: Facility) { return this.facilityService.calculateDistance(this.facilityService.userLocation, f.coordinates); }
  getCategoryConfig(c: Facility['category']) { return CATEGORY_CONFIG[c]; }

  clearFilters() { this.searchTerm = ''; this.selectedCategory = 'All'; this.maxPrice = 250; this.radiusKm = 30; this.activeCategoryFilters.set(['Gym', 'Conference Hall', 'Swimming Pool', 'Tennis Court']); this.onFilterChange(); }
  onFilterChange() { this.cdr.markForCheck(); if (this.viewMode() === 'map' && this.mapInstance) { this.renderMarkers(); this.updateRadiusCircle(); } }
  onMapFilterChange() { this.cdr.markForCheck(); this.renderMarkers(); this.updateRadiusCircle(); }
  toggleCategoryFilter(cat: string) { const c = this.activeCategoryFilters(); if (c.includes(cat)) { if (c.length > 1) this.activeCategoryFilters.set(c.filter(x => x !== cat)); } else { this.activeCategoryFilters.set([...c, cat]); } this.renderMarkers(); }

  setViewMode(mode: 'list' | 'map') { this.viewMode.set(mode); this.cdr.markForCheck(); if (mode === 'map' && this.isMapboxLoaded()) setTimeout(() => this.ensureMapReady(), 150); }

  private ensureMapReady() {
    const c = document.getElementById('main-map');
    if (!c || c.offsetWidth === 0) { setTimeout(() => this.ensureMapReady(), 100); return; }
    if (!this.mapInstance) { this.initializeMainMap(); }
    else { const cv = c.querySelector('canvas'); if (!cv || cv.width === 0) { (this.mapInstance as MapInstance).remove(); this.mapInstance = null; this.markers = []; this.initializeMainMap(); } else { (this.mapInstance as MapInstance).resize(); this.renderMarkers(); } }
  }

  flyToFacility(e: Event, f: Facility) { e.stopPropagation(); this.setViewMode('map'); setTimeout(() => { (this.mapInstance as unknown as MapboxMapFull)?.flyTo({ center: f.coordinates, zoom: 15, speed: 1.4, curve: 1.4, essential: true }); }, 300); }
  openDetails(f: Facility) { this.selectedFacility.set(f); this.showMiniMap.set(false); this.detailRouteInfo.set(null); }
  closeDetails() { this.selectedFacility.set(null); this.showMiniMap.set(false); this.detailRouteInfo.set(null); (this.miniMapInstance as MapInstance | null)?.remove(); this.miniMapInstance = null; if (this.viewMode() === 'map') setTimeout(() => (this.mapInstance as MapInstance | null)?.resize(), 100); }
  showLocalizedMap() { this.showMiniMap.update(v => !v); if (this.showMiniMap()) setTimeout(() => { const f = this.selectedFacility(); if (f) this.initializeMiniMap(f); }, 100); }

  // ── Directions (from current GPS) ──
  private async fetchRoute(from: [number, number], to: [number, number]): Promise<{ info: RouteInfo; coords: [number, number][] } | null> {
    const fac = this.selectedFacility() ?? this.routeFacilityRef;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json() as { routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] } }> };
    if (!data.routes?.[0]) return null;
    const r = data.routes[0];
    return {
      info: { distanceKm: Number((r.distance / 1000).toFixed(1)), durationMin: Math.round(r.duration / 60), facilityName: fac?.name ?? '', facilityEmoji: fac ? CATEGORY_CONFIG[fac.category].emoji : '' },
      coords: r.geometry.coordinates,
    };
  }

  private routeFacilityRef: Facility | null = null;

  async showRouteFromCurrentLocation(facility: Facility) {
    this.routeFacilityRef = facility;
    this.isLoadingRoute.set(true);
    this.cdr.markForCheck();

    const origin = await this.getUserGPSLocation();
    try {
      const result = await this.fetchRoute(origin, facility.coordinates);
      if (result) {
        this.routeInfo.set(result.info);
        this.pendingRouteGeometry = result.coords;
        this.drawRouteOnMap(result.coords);
        // Fit the map to the route bounds
        const map = this.mapInstance as unknown as MapboxMapFull | null;
        if (map) {
          const lons = result.coords.map(c => c[0]);
          const lats = result.coords.map(c => c[1]);
          map.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 80, duration: 1200 });
        }
      }
    } catch { console.error('Route fetch failed'); }
    finally { this.isLoadingRoute.set(false); this.cdr.markForCheck(); }
  }

  async getDirectionsForDetail() {
    const fac = this.selectedFacility();
    if (!fac) return;
    this.routeFacilityRef = fac;
    this.isLoadingRoute.set(true);
    const origin = await this.getUserGPSLocation();
    try {
      const result = await this.fetchRoute(origin, fac.coordinates);
      if (result) { this.detailRouteInfo.set(result.info); this.pendingRouteGeometry = result.coords; }
    } catch { console.error('Route fetch failed'); }
    finally { this.isLoadingRoute.set(false); this.cdr.markForCheck(); }
  }

  private getUserGPSLocation(): Promise<[number, number]> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(this.facilityService.userLocation); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
        () => resolve(this.facilityService.userLocation),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  }

  clearRoute() { this.routeInfo.set(null); this.pendingRouteGeometry = null; this.routeFacilityRef = null; const m = this.mapInstance as unknown as MapboxMapFull | null; if (!m) return; if (m.getLayer('route-line')) m.removeLayer('route-line'); if (m.getLayer('route-outline')) m.removeLayer('route-outline'); if (m.getSource('route')) m.removeSource('route'); }

  private drawRouteOnMap(coords: [number, number][]) {
    const map = this.mapInstance as unknown as MapboxMapFull | null;
    if (!map) return;
    if (map.getLayer('route-line')) map.removeLayer('route-line');
    if (map.getLayer('route-outline')) map.removeLayer('route-outline');
    if (map.getSource('route')) map.removeSource('route');
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } });
    map.addLayer({ id: 'route-outline', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#312e81', 'line-width': 8, 'line-opacity': 0.3 } });
    map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#6366f1', 'line-width': 5, 'line-opacity': 0.9 } });
  }

  onDocumentClick(event: MouseEvent) {
    const t = event.target as HTMLElement;
    if (t.classList.contains('popup-details-btn')) { const id = t.getAttribute('data-id'); if (id) { const f = this.facilities().find(x => x.id === Number(id)); if (f) { this.closeAllPopups(); this.openDetails(f); this.cdr.markForCheck(); } } }
    if (t.classList.contains('popup-route-btn')) { const id = t.getAttribute('data-id'); if (id) { const f = this.facilities().find(x => x.id === Number(id)); if (f) { this.closeAllPopups(); this.showRouteFromCurrentLocation(f); this.cdr.markForCheck(); } } }
  }

  private closeAllPopups() { (this.markers as Array<{ getPopup(): { isOpen(): boolean }; togglePopup(): void }>).forEach(m => { if (m.getPopup().isOpen()) m.togglePopup(); }); }

  changeMapStyle(id: string) {
    this.currentMapStyle.set(id);
    if (!['streets-v12', 'outdoors-v12'].includes(id) && this.is3DActive()) { this.is3DActive.set(false); }
    const map = this.mapInstance as unknown as MapboxMapFull | null;
    if (!map) return;
    map.setStyle(`mapbox://styles/mapbox/${id}`);
    (map as unknown as { once(e: string, fn: () => void): void }).once('style.load', () => {
      this.renderMarkers(); this.add3DBuildings(); this.addUserLocationPulse(); this.addRadiusCircleSource(); this.updateRadiusCircle();
      if (this.pendingRouteGeometry) this.drawRouteOnMap(this.pendingRouteGeometry);
      if (this.is3DActive()) map.easeTo({ pitch: 55, bearing: -20, duration: 600 });
    });
  }

  toggle3DView() {
    this.is3DActive.update(v => !v);
    const map = this.mapInstance as unknown as MapboxMapFull | null;
    if (!map) return;
    if (this.is3DActive()) map.easeTo({ pitch: 55, bearing: -20, zoom: 15, center: this.facilityService.userLocation, duration: 1200 });
    else map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
  }

  // ── Script loading ──
  private loadMapboxScripts() {
    const win = window as unknown as { mapboxgl?: { accessToken: string } };
    if (document.querySelector('script[src*="mapbox-gl"]') && win.mapboxgl) { win.mapboxgl.accessToken = MAPBOX_TOKEN; this.isMapboxLoaded.set(true); setTimeout(() => this.ensureMapReady(), 200); return; }
    const link = document.createElement('link'); link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css'; link.rel = 'stylesheet'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js';
    script.onload = () => { (window as unknown as { mapboxgl: { accessToken: string } }).mapboxgl.accessToken = MAPBOX_TOKEN; this.isMapboxLoaded.set(true); this.cdr.markForCheck(); setTimeout(() => this.ensureMapReady(), 200); };
    document.head.appendChild(script);
  }

  // ── Map init ──
  private initializeMainMap() {
    if (!this.isMapboxLoaded()) return;
    const mapboxgl = (window as { mapboxgl?: MapboxGl }).mapboxgl;
    if (!mapboxgl) return;
    if (!this.mapInstance) {
      try {
        this.mapInstance = new mapboxgl.Map({ container: 'main-map', style: `mapbox://styles/mapbox/${this.currentMapStyle()}`, center: this.facilityService.userLocation, zoom: 13 });
        const map = this.mapInstance as MapInstance;
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true }), 'bottom-right');
        map.on('load', () => { map.resize(); setTimeout(() => { map.resize(); this.renderMarkers(); this.add3DBuildings(); this.addUserLocationPulse(); this.addRadiusCircleSource(); this.updateRadiusCircle(); if (this.pendingRouteGeometry) this.drawRouteOnMap(this.pendingRouteGeometry); }, 100); });
        map.on('error', (e: unknown) => { const err = e as { error?: { message?: string } }; if (err.error?.message?.includes('Blocked')) return; });
      } catch (e) { console.error('Map init error:', e); }
    } else { (this.mapInstance as MapInstance).resize(); }
  }

  // ── 3D Buildings ──
  private add3DBuildings() {
    const map = this.mapInstance as unknown as MapboxMapFull | null;
    if (!map || map.getLayer('3d-buildings') || !['streets-v12', 'outdoors-v12'].includes(this.currentMapStyle())) return;
    try {
      const layers = map.getStyle()?.layers as Array<{ id: string; type?: string }> | undefined;
      const before = layers?.find(l => l.type === 'symbol' && (l.id.includes('label') || l.id.includes('place')))?.id;
      map.addLayer({ id: '3d-buildings', source: 'composite', 'source-layer': 'building', filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 14, paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'], 0, '#c8d6e5', 20, '#a8b8c8', 50, '#8899aa', 100, '#6677aa'], 'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 16.5, ['get', 'height']], 'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 16.5, ['get', 'min_height']], 'fill-extrusion-opacity': 0.85 } }, before);
    } catch { /* no composite source */ }
  }

  // ── User pulse ──
  private addUserLocationPulse() {
    const map = this.mapInstance as unknown as MapboxMapFull | null;
    if (!map || map.getLayer('user-pulse')) return;
    const [lon, lat] = this.facilityService.userLocation;
    if (!map.getSource('user-loc-src')) map.addSource('user-loc-src', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [lon, lat] } } });
    map.addLayer({ id: 'user-pulse', type: 'circle', source: 'user-loc-src', paint: { 'circle-radius': 16, 'circle-color': '#6366f1', 'circle-opacity': 0.2 } });
    map.addLayer({ id: 'user-dot', type: 'circle', source: 'user-loc-src', paint: { 'circle-radius': 7, 'circle-color': '#6366f1', 'circle-stroke-width': 3, 'circle-stroke-color': '#fff' } });
    let s = 12, g = true;
    const anim = () => { if (!map.getLayer('user-pulse')) return; s = g ? s + 0.4 : s - 0.4; if (s >= 22) g = false; if (s <= 10) g = true; try { map.setPaintProperty('user-pulse', 'circle-radius', s); } catch { return; } requestAnimationFrame(anim); };
    requestAnimationFrame(anim);
  }

  // ── Radius circle ──
  private addRadiusCircleSource() { const m = this.mapInstance as unknown as MapboxMapFull | null; if (!m || m.getSource('radius-circle')) return; m.addSource('radius-circle', { type: 'geojson', data: this.buildCircle() }); m.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius-circle', paint: { 'fill-color': '#6366f1', 'fill-opacity': 0.06 } }); m.addLayer({ id: 'radius-border', type: 'line', source: 'radius-circle', paint: { 'line-color': '#6366f1', 'line-width': 2, 'line-dasharray': [3, 3] } }); }
  private updateRadiusCircle() { const m = this.mapInstance as unknown as MapboxMapFull | null; if (!m || !m.getSource('radius-circle')) return; (m.getSource('radius-circle') as { setData(d: unknown): void }).setData(this.buildCircle()); }
  private buildCircle() { const [lon, lat] = this.facilityService.userLocation; const rd = this.radiusKm / 111.32; const pts = 64; const c: [number, number][] = Array.from({ length: pts + 1 }, (_, i) => { const a = (i / pts) * 2 * Math.PI; return [lon + rd * Math.cos(a), lat + (rd / Math.cos((lat * Math.PI) / 180)) * Math.sin(a)]; }); return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [c] } }; }

  // ── Markers ──
  private renderMarkers() {
    const mapboxgl = (window as { mapboxgl?: MapboxGl }).mapboxgl;
    if (!mapboxgl || !this.mapInstance) return;
    (this.markers as Array<{ remove(): void }>).forEach(m => m.remove());
    this.markers = [];
    this.filteredFacilities().forEach(f => {
      const cfg = CATEGORY_CONFIG[f.category];
      const el = document.createElement('div');
      el.style.cssText = `width:36px;height:36px;border-radius:50%;background:${f.isAvailable ? cfg.color : '#94a3b8'};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:transform .15s`;
      el.textContent = cfg.emoji;
      el.setAttribute('aria-label', f.name);
      el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.2)');
      el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
      const dist = this.getDistance(f);
      const popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: '270px' }).setHTML(`
        <div style="font-family:system-ui,sans-serif;min-width:230px;border-radius:14px;overflow:hidden">
          <img src="${f.imageUrl}" alt="${f.name}" style="width:100%;height:105px;object-fit:cover;display:block">
          <div style="padding:10px 12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${cfg.bg};color:${cfg.color}">${cfg.emoji} ${f.category}</span>
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${f.isAvailable ? '#d1fae5' : '#f1f5f9'};color:${f.isAvailable ? '#059669' : '#475569'}">${f.isAvailable ? '● Available' : 'Booked'}</span>
            </div>
            <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:6px 0 2px">${f.name}</h3>
            <p style="font-size:11px;color:#64748b;margin:0 0 8px">${dist} km · <strong style="color:#6366f1">$${f.pricePerHour}/hr</strong></p>
            <div style="display:flex;gap:6px">
              <button class="popup-route-btn" data-id="${f.id}" style="flex:1;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:none;padding:8px 0;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.3px">🗺 Route Here</button>
              <button class="popup-details-btn" data-id="${f.id}" style="flex:1;background:#f1f5f9;color:#334155;border:none;padding:8px 0;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer">Details</button>
            </div>
          </div>
        </div>`);
      const marker = new mapboxgl.Marker(el).setLngLat(f.coordinates).setPopup(popup).addTo(this.mapInstance as MapInstance);
      this.markers.push(marker);
    });
  }

  // ── Mini map ──
  private initializeMiniMap(f: Facility) {
    const mapboxgl = (window as { mapboxgl?: MapboxGl }).mapboxgl; if (!mapboxgl) return;
    (this.miniMapInstance as MapInstance | null)?.remove();
    try {
      this.miniMapInstance = new mapboxgl.Map({ container: 'mini-map', style: `mapbox://styles/mapbox/${this.currentMapStyle()}`, center: f.coordinates, zoom: 15 });
      const mm = this.miniMapInstance as MapInstance;
      mm.on('load', () => { mm.resize(); if (this.pendingRouteGeometry) { const m = this.miniMapInstance as unknown as MapboxMapFull; if (m.getLayer('mini-route')) m.removeLayer('mini-route'); if (m.getSource('mini-route-src')) m.removeSource('mini-route-src'); m.addSource('mini-route-src', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: this.pendingRouteGeometry } } }); m.addLayer({ id: 'mini-route', type: 'line', source: 'mini-route-src', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#6366f1', 'line-width': 4, 'line-opacity': 0.8 } }); } });
      const cfg = CATEGORY_CONFIG[f.category];
      const el = document.createElement('div'); el.style.cssText = `width:40px;height:40px;border-radius:50%;background:${cfg.color};border:4px solid white;box-shadow:0 2px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:18px`; el.textContent = cfg.emoji;
      new mapboxgl.Marker(el).setLngLat(f.coordinates).addTo(mm);
      const uel = document.createElement('div'); uel.style.cssText = `width:14px;height:14px;border-radius:50%;background:#6366f1;border:3px solid white;box-shadow:0 0 0 4px rgba(99,102,241,.3)`;
      new mapboxgl.Marker(uel).setLngLat(this.facilityService.userLocation).addTo(mm);
    } catch (e) { console.error('Mini-map error:', e); }
  }

  submitToken() {} // no-op — token hardcoded
  skipToken() {}   // no-op — token hardcoded
}

// ---------------------------------------------------------------------------
interface MapInstance { resize(): void; remove(): void; on(e: string, h: (e: unknown) => void): void; addControl(c: unknown, p?: string): void; setStyle(s: string): void; }
interface MapboxMapFull extends MapInstance { getLayer(id: string): unknown; removeLayer(id: string): void; getSource(id: string): unknown; removeSource(id: string): void; addSource(id: string, s: unknown): void; addLayer(l: unknown, b?: string): void; setPaintProperty(l: string, p: string, v: unknown): void; once(e: string, fn: () => void): void; flyTo(o: object): void; easeTo(o: object): void; fitBounds(b: unknown, o?: object): void; getStyle(): { layers?: unknown[] } | undefined; setStyle(s: string): void; }
interface MapboxGl { accessToken: string; Map: new (o: { container: string; style: string; center: [number, number]; zoom: number }) => MapInstance; Marker: new (el?: HTMLElement) => { setLngLat(c: [number, number]): { setPopup(p: unknown): { addTo(m: MapInstance): unknown }; addTo(m: MapInstance): unknown }; getPopup(): { isOpen(): boolean }; togglePopup(): void; remove(): void }; Popup: new (o?: { offset?: number; closeButton?: boolean; maxWidth?: string }) => { setHTML(h: string): unknown; isOpen(): boolean }; NavigationControl: new () => unknown; GeolocateControl: new (o: object) => unknown; }
