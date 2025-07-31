# ⚡ PERFORMANCE OPTIMIZATION GUIDE

## 🎯 **PERFORMANCE GOALS**

### **Target Metrics**
- 📱 **Mobile Performance**: Lighthouse score > 90
- ⚡ **Page Load Time**: < 2 seconds
- 🚀 **First Contentful Paint**: < 1.5 seconds  
- 💾 **Bundle Size**: < 500kb gzipped
- 🔄 **API Response Time**: < 500ms
- 📊 **Memory Usage**: < 50MB

---

## 📦 **CODE SPLITTING & LAZY LOADING**

### **1. Route-Based Code Splitting**

```typescript
// client/App.tsx - IMPLEMENT
import { lazy, Suspense } from 'react';

// Lazy load page components
const AddMeal = lazy(() => import('./pages/AddMeal'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Profile = lazy(() => import('./pages/Profile'));

// Enhanced lazy loading with error boundaries
const LazyComponent = lazy(() => 
  import('./pages/Analytics').catch(() => ({
    default: () => <div>Failed to load component</div>
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-mint-600 font-medium">Yuklanmoqda...</p>
    </div>
  </div>
);

// App routes with Suspense
const AppRoutes = () => (
  <Layout>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  </Layout>
);
```

### **2. Component-Level Lazy Loading**

```typescript
// Heavy components lazy loading
const AdvancedAnalytics = lazy(() => import('./components/AdvancedAnalytics'));
const SmartCalorieTracker = lazy(() => import('./components/SmartCalorieTracker'));
const AIChat = lazy(() => import('./components/AIChat'));

// Chart components
const Charts = lazy(() => import('./components/Charts'));
const ResponsiveChart = lazy(() => import('recharts'));

// Conditional lazy loading
const loadAdvancedFeatures = async () => {
  const { AdvancedAnalytics } = await import('./features/AdvancedAnalytics');
  const { AIAssistant } = await import('./features/AIAssistant');
  
  return { AdvancedAnalytics, AIAssistant };
};

// Usage in component
const AnalyticsPage = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleShowAdvanced = async () => {
    setShowAdvanced(true);
    // Pre-load advanced features
    loadAdvancedFeatures();
  };
  
  return (
    <div>
      <BasicAnalytics />
      {showAdvanced && (
        <Suspense fallback={<AnalyticsLoading />}>
          <AdvancedAnalytics />
        </Suspense>
      )}
    </div>
  );
};
```

---

## 🔄 **STATE MANAGEMENT OPTIMIZATION**

### **1. React Query Implementation**

```typescript
// hooks/useOptimizedQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Optimized user profile query
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Optimized food data with infinite scroll
export const useFoodDatabase = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ['foods', searchTerm],
    queryFn: ({ pageParam = 0 }) => fetchFoods(searchTerm, pageParam),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length : undefined,
    staleTime: 1000 * 60 * 15, // 15 minutes for food data
    keepPreviousData: true,
  });
};

// Mutation with optimistic updates
export const useAddMeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addMealToDatabase,
    onMutate: async (newMeal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['meals'] });
      
      // Snapshot previous value
      const previousMeals = queryClient.getQueryData(['meals']);
      
      // Optimistically update
      queryClient.setQueryData(['meals'], (old: Meal[]) => [
        ...old,
        { ...newMeal, id: Date.now().toString() }
      ]);
      
      return { previousMeals };
    },
    onError: (err, newMeal, context) => {
      // Rollback on error
      queryClient.setQueryData(['meals'], context?.previousMeals);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};
```

### **2. Context Optimization**

```typescript
// contexts/OptimizedUserContext.tsx
import { createContext, useContext, useMemo, useCallback } from 'react';

// Split contexts to prevent unnecessary re-renders
const UserDataContext = createContext<UserProfile | null>(null);
const UserActionsContext = createContext<UserActions | null>(null);

// Optimized provider with memoization
export const OptimizedUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Memoize actions to prevent re-renders
  const userActions = useMemo(() => ({
    updateUser: useCallback((userData: UserProfile) => {
      setUser(userData);
      // Persist to localStorage
      localStorage.setItem(`userProfile_${userData.telegramId}`, JSON.stringify(userData));
    }, []),
    
    clearUser: useCallback(() => {
      setUser(null);
      localStorage.clear();
    }, []),
    
    updateField: useCallback((field: keyof UserProfile, value: any) => {
      setUser(prev => prev ? { ...prev, [field]: value } : null);
    }, []),
  }), []);
  
  return (
    <UserDataContext.Provider value={user}>
      <UserActionsContext.Provider value={userActions}>
        {children}
      </UserActionsContext.Provider>
    </UserDataContext.Provider>
  );
};

// Optimized hooks
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within OptimizedUserProvider');
  }
  return context;
};

export const useUserActions = () => {
  const context = useContext(UserActionsContext);
  if (context === undefined) {
    throw new Error('useUserActions must be used within OptimizedUserProvider');
  }
  return context;
};
```

---

## 🎨 **RENDERING OPTIMIZATION**

### **1. Virtual Scrolling Implementation**

```typescript
// components/VirtualizedList.tsx
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { FixedSizeGrid as Grid } from 'react-window';

interface VirtualizedFoodListProps {
  foods: Food[];
  onFoodSelect: (food: Food) => void;
}

export const VirtualizedFoodList: React.FC<VirtualizedFoodListProps> = ({ 
  foods, 
  onFoodSelect 
}) => {
  const FoodItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const food = foods[index];
    
    return (
      <div style={style} className="p-2">
        <FoodCard 
          key={food.id}
          food={food} 
          onAdd={onFoodSelect}
          className="h-full"
        />
      </div>
    );
  };
  
  return (
    <List
      height={400}
      itemCount={foods.length}
      itemSize={120}
      itemData={foods}
      overscanCount={5} // Pre-render 5 items outside viewport
    >
      {FoodItem}
    </List>
  );
};

// Grid virtualization for large datasets
export const VirtualizedFoodGrid: React.FC<VirtualizedFoodListProps> = ({ 
  foods, 
  onFoodSelect 
}) => {
  const COLUMN_COUNT = 3;
  const ROW_COUNT = Math.ceil(foods.length / COLUMN_COUNT);
  
  const GridItem = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const food = foods[index];
    
    if (!food) return null;
    
    return (
      <div style={style} className="p-2">
        <FoodCard food={food} onAdd={onFoodSelect} />
      </div>
    );
  };
  
  return (
    <Grid
      columnCount={COLUMN_COUNT}
      columnWidth={200}
      height={400}
      rowCount={ROW_COUNT}
      rowHeight={140}
      overscanRowCount={2}
      overscanColumnCount={1}
    >
      {GridItem}
    </Grid>
  );
};
```

### **2. Memoization & Component Optimization**

```typescript
// components/OptimizedFoodCard.tsx
import React, { memo, useMemo, useCallback } from 'react';

interface OptimizedFoodCardProps {
  food: Food;
  onAdd: (food: Food) => void;
  isSelected?: boolean;
}

// Memoized component with custom comparison
export const OptimizedFoodCard = memo<OptimizedFoodCardProps>(({ 
  food, 
  onAdd, 
  isSelected 
}) => {
  // Memoize expensive calculations
  const nutritionSummary = useMemo(() => ({
    totalNutrients: food.protein + food.carbs + food.fat,
    caloriesPerGram: food.calories / food.portion,
    proteinPercentage: (food.protein * 4 / food.calories) * 100,
  }), [food]);
  
  // Memoize event handlers
  const handleAdd = useCallback(() => {
    onAdd(food);
  }, [food, onAdd]);
  
  const handleQuickAdd = useCallback(() => {
    onAdd({ ...food, portion: food.portion * 0.5 });
  }, [food, onAdd]);
  
  return (
    <Card className={`hover-lift ${isSelected ? 'ring-2 ring-mint-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{food.image}</div>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium">{food.name}</h4>
              <p className="text-sm text-muted-foreground">
                {food.calories} kal • {food.portion}{food.unit}
              </p>
            </div>
            
            {/* Memoized nutrition display */}
            <NutritionDisplay 
              protein={food.protein}
              carbs={food.carbs}
              fat={food.fat}
              fiber={food.fiber}
            />
            
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAdd} className="flex-1">
                <Plus className="w-3 h-3 mr-1" />
                Qo'shish
              </Button>
              <Button size="sm" variant="outline" onClick={handleQuickAdd}>
                <Zap className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.food.id === nextProps.food.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onAdd === nextProps.onAdd
  );
});

// Memoized nutrition display component
const NutritionDisplay = memo<{
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}>(({ protein, carbs, fat, fiber }) => (
  <div className="grid grid-cols-4 gap-1 text-xs">
    <NutrientItem label="Oqsil" value={protein} color="green" />
    <NutrientItem label="Uglevod" value={carbs} color="blue" />
    <NutrientItem label="Yog'" value={fat} color="yellow" />
    <NutrientItem label="Tola" value={fiber} color="purple" />
  </div>
));

const NutrientItem = memo<{
  label: string;
  value: number;
  color: string;
}>(({ label, value, color }) => (
  <div className="text-center">
    <p className={`font-medium text-${color}-600`}>{value}g</p>
    <p className="text-muted-foreground">{label}</p>
  </div>
));
```

---

## 💾 **DATA OPTIMIZATION**

### **1. Efficient Data Structures**

```typescript
// utils/dataStructures.ts

// Use Map for O(1) lookups instead of arrays
class OptimizedFoodDatabase {
  private foodsMap = new Map<string, Food>();
  private categoriesMap = new Map<string, Food[]>();
  private searchIndex = new Map<string, Set<string>>();
  
  constructor(foods: Food[]) {
    this.buildIndexes(foods);
  }
  
  private buildIndexes(foods: Food[]) {
    foods.forEach(food => {
      // Main food map
      this.foodsMap.set(food.id, food);
      
      // Category index
      if (!this.categoriesMap.has(food.category)) {
        this.categoriesMap.set(food.category, []);
      }
      this.categoriesMap.get(food.category)!.push(food);
      
      // Search index for fast text search
      const searchTerms = food.name.toLowerCase().split(' ');
      searchTerms.forEach(term => {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, new Set());
        }
        this.searchIndex.get(term)!.add(food.id);
      });
    });
  }
  
  // O(1) food lookup
  getFood(id: string): Food | undefined {
    return this.foodsMap.get(id);
  }
  
  // O(1) category lookup
  getFoodsByCategory(category: string): Food[] {
    return this.categoriesMap.get(category) || [];
  }
  
  // Optimized search with ranking
  search(query: string): Food[] {
    const terms = query.toLowerCase().split(' ');
    const matchingIds = new Map<string, number>();
    
    terms.forEach(term => {
      const ids = this.searchIndex.get(term);
      if (ids) {
        ids.forEach(id => {
          matchingIds.set(id, (matchingIds.get(id) || 0) + 1);
        });
      }
    });
    
    // Sort by relevance (number of matching terms)
    return Array.from(matchingIds.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => this.foodsMap.get(id)!)
      .filter(Boolean);
  }
}

// Usage
const foodDatabase = new OptimizedFoodDatabase(POPULAR_FOODS);
```

### **2. Local Storage Optimization**

```typescript
// utils/storage.ts

class OptimizedStorage {
  private cache = new Map<string, any>();
  private compression = true;
  
  // Compressed storage for large data
  setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      
      if (this.compression && serialized.length > 1024) {
        // Use compression for large data
        const compressed = this.compress(serialized);
        localStorage.setItem(key, compressed);
      } else {
        localStorage.setItem(key, serialized);
      }
      
      // Update cache
      this.cache.set(key, value);
    } catch (error) {
      console.error('Storage error:', error);
      this.handleStorageError(key, value);
    }
  }
  
  getItem<T>(key: string): T | null {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = item.startsWith('{') || item.startsWith('[') 
        ? JSON.parse(item)
        : JSON.parse(this.decompress(item));
      
      // Update cache
      this.cache.set(key, parsed);
      return parsed;
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }
  
  // Batch operations for better performance
  setItems(items: Record<string, any>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }
  
  // Clear old data to prevent storage overflow
  clearOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('timestamp_')) {
        const timestamp = this.getItem<number>(key);
        if (timestamp && now - timestamp > maxAge) {
          keysToRemove.push(key.replace('timestamp_', ''));
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`timestamp_${key}`);
      this.cache.delete(key);
    });
  }
  
  private compress(data: string): string {
    // Simple compression (in production, use a library like lz-string)
    return btoa(data);
  }
  
  private decompress(data: string): string {
    return atob(data);
  }
  
  private handleStorageError(key: string, value: any): void {
    // Clear old data and retry
    this.clearOldData();
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (retryError) {
      console.error('Storage retry failed:', retryError);
      // Fallback to session storage or memory
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }
}

export const optimizedStorage = new OptimizedStorage();
```

---

## 🚀 **NETWORK OPTIMIZATION**

### **1. API Request Optimization**

```typescript
// services/optimizedApi.ts

class OptimizedApiService {
  private requestCache = new Map<string, Promise<any>>();
  private retryAttempts = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  
  // Request deduplication
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Return existing request if in progress
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }
    
    const requestPromise = this.executeRequest<T>(url, options);
    this.requestCache.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up cache after completion
      setTimeout(() => this.requestCache.delete(cacheKey), 5000);
    }
  }
  
  private async executeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic
      const attempts = this.retryAttempts.get(url) || 0;
      if (attempts < this.maxRetries && this.isRetryableError(error)) {
        this.retryAttempts.set(url, attempts + 1);
        await this.delay(this.retryDelay * Math.pow(2, attempts));
        return this.executeRequest<T>(url, options);
      }
      
      this.retryAttempts.delete(url);
      throw error;
    }
  }
  
  // Batch API requests
  async batchRequest<T>(requests: Array<{ url: string; options?: RequestInit }>): Promise<T[]> {
    const promises = requests.map(({ url, options }) => this.request<T>(url, options));
    return Promise.all(promises);
  }
  
  // Background sync for offline support
  async backgroundSync(data: any, endpoint: string): Promise<void> {
    if (navigator.onLine) {
      await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } else {
      // Queue for background sync when online
      this.queueBackgroundSync(data, endpoint);
    }
  }
  
  private queueBackgroundSync(data: any, endpoint: string): void {
    const queue = JSON.parse(localStorage.getItem('backgroundSyncQueue') || '[]');
    queue.push({ data, endpoint, timestamp: Date.now() });
    localStorage.setItem('backgroundSyncQueue', JSON.stringify(queue));
  }
  
  private isRetryableError(error: any): boolean {
    return error.name === 'AbortError' || 
           error.message.includes('Network') ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503');
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new OptimizedApiService();
```

### **2. Image Optimization**

```typescript
// components/OptimizedImage.tsx

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  quality = 75,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate optimized image URLs
  const optimizedSrc = useMemo(() => {
    // For external images, use a service like Cloudinary or ImageKit
    if (src.startsWith('http')) {
      return `${src}?w=${width}&h=${height}&q=${quality}&f=webp`;
    }
    return src;
  }, [src, width, height, quality]);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    } else {
      setIsLoaded(true);
    }
  }, [loading]);
  
  // Preload critical images
  useEffect(() => {
    if (loading === 'eager') {
      const img = new Image();
      img.src = optimizedSrc;
    }
  }, [optimizedSrc, loading]);
  
  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual image */}
      {isLoaded && !error && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading={loading}
          decoding="async"
        />
      )}
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Rasm yuklanmadi</span>
        </div>
      )}
    </div>
  );
};
```

---

## 📱 **PWA & OFFLINE SUPPORT**

### **1. Service Worker Implementation**

```typescript
// public/sw.ts

const CACHE_NAME = 'caloria-ai-v1';
const OFFLINE_URL = '/offline.html';

const CACHE_URLS = [
  '/',
  '/onboarding',
  '/profile',
  '/add-meal',
  '/analytics',
  '/assistant',
  '/offline.html',
  '/manifest.json',
  // Add critical CSS and JS files
];

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event with advanced caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response for caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  const queue = JSON.parse(localStorage.getItem('backgroundSyncQueue') || '[]');
  
  for (const item of queue) {
    try {
      await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
  
  localStorage.removeItem('backgroundSyncQueue');
}
```

### **2. PWA Manifest**

```json
// public/manifest.json
{
  "name": "Caloria AI - Smart Health Tracker",
  "short_name": "Caloria AI",
  "description": "AI-powered health and nutrition tracking for Telegram",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#22C55E",
  "background_color": "#F8FAFC",
  "lang": "uz",
  "scope": "/",
  "categories": ["health", "fitness", "lifestyle"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

---

## 📊 **MONITORING & ANALYTICS**

### **1. Performance Monitoring**

```typescript
// utils/performance.ts

class PerformanceMonitor {
  private metrics = new Map<string, number>();
  private readonly reportEndpoint = '/api/performance';
  
  // Core Web Vitals tracking
  trackWebVitals() {
    // First Contentful Paint
    this.observePerformanceEntry('first-contentful-paint', (entry) => {
      this.recordMetric('FCP', entry.startTime);
    });
    
    // Largest Contentful Paint
    this.observeLCP();
    
    // First Input Delay
    this.observeFID();
    
    // Cumulative Layout Shift
    this.observeCLS();
  }
  
  private observePerformanceEntry(entryType: string, callback: (entry: any) => void) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry);
      }
    });
    
    observer.observe({ entryTypes: [entryType] });
  }
  
  private observeLCP() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  private observeFID() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
  }
  
  private observeCLS() {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  // Custom metrics
  startTimer(name: string): void {
    this.metrics.set(`${name}_start`, performance.now());
  }
  
  endTimer(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      this.metrics.delete(`${name}_start`);
      return duration;
    }
    return 0;
  }
  
  // Memory usage
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('memory_used', memory.usedJSHeapSize);
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit);
    }
  }
  
  private recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    
    // Send to analytics (debounced)
    this.debouncedReport();
  }
  
  private debouncedReport = this.debounce(() => {
    this.reportMetrics();
  }, 5000);
  
  private async reportMetrics(): Promise<void> {
    const metricsObject = Object.fromEntries(this.metrics);
    
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metricsObject,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }
  
  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Usage in App.tsx
export default function App() {
  useEffect(() => {
    performanceMonitor.trackWebVitals();
    performanceMonitor.trackMemoryUsage();
    
    // Track route changes
    performanceMonitor.startTimer('route_load');
  }, []);
  
  // ... rest of app
}
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Immediate Optimizations (Week 1)**
- [ ] ✅ Implement route-based code splitting
- [ ] ✅ Add React Query for state management
- [ ] ✅ Optimize component re-renders with memo
- [ ] ✅ Implement virtual scrolling for lists
- [ ] ✅ Add loading states and skeletons

### **Phase 2: Advanced Optimizations (Week 2)**
- [ ] ⏳ Service Worker and PWA support
- [ ] ⏳ Image optimization and lazy loading
- [ ] ⏳ API request deduplication and caching
- [ ] ⏳ Background sync for offline support
- [ ] ⏳ Performance monitoring setup

### **Phase 3: Fine-tuning (Week 3)**
- [ ] ⏳ Bundle analysis and tree shaking
- [ ] ⏳ Database query optimization
- [ ] ⏳ Memory leak detection and fixes
- [ ] ⏳ Performance budget enforcement
- [ ] ⏳ A/B testing for optimization impact

---

## 📈 **EXPECTED RESULTS**

### **Performance Improvements**
- 🚀 **Page Load Time**: 60% faster (4s → 1.5s)
- 📱 **Mobile Performance**: Lighthouse score 70 → 90+
- 💾 **Bundle Size**: 40% reduction (800kb → 480kb)
- 🔄 **API Response Time**: 50% faster (1s → 500ms)
- 📊 **Memory Usage**: 30% reduction (70MB → 50MB)

### **User Experience Impact**
- ⚡ **Faster app startup and navigation**
- 📱 **Smoother scrolling and interactions**
- 🔄 **Better offline experience**
- 💾 **Reduced data usage**
- 🔋 **Less battery consumption**

### **Business Benefits**
- 📈 **Higher user retention** (+15%)
- ⭐ **Better app store ratings** (+0.5 stars)
- 💰 **Reduced hosting costs** (-20%)
- 🌍 **Better global accessibility**
- 🚀 **Improved SEO and discoverability**

---

This comprehensive performance optimization guide will transform Caloria AI into a lightning-fast, world-class application! 🚀