# Course Discovery & SEO System

تم إنشاء نظام اكتشاف الكورسات وتحسين محركات البحث (SEO) لتحسين ظهور الكورسات على المنصة وعلى Google.

## Backend APIs (routes/discoveryRoute.js)

### 1. Home Page Data (All in One)
```
GET /api/v1/discovery/home
```
Returns: trending, featured, newCourses, bestsellers, freeCourses

### 2. Trending Courses (Based on Recent Sales - 30 days)
```
GET /api/v1/discovery/trending?limit=10
```
Algorithm: Courses with most purchases in the last 30 days

### 3. Featured Courses (High Rating + Good Sales)
```
GET /api/v1/discovery/featured?limit=8
```
Algorithm: Courses with rating >= 4 and at least 3 reviews

### 4. New Courses
```
GET /api/v1/discovery/new?limit=10
```
Algorithm: Most recently created courses

### 5. Bestsellers (All Time)
```
GET /api/v1/discovery/bestsellers?limit=10
```
Algorithm: Courses sorted by total sales

### 6. Free Courses
```
GET /api/v1/discovery/free?limit=10
```
Algorithm: Courses where isFree=true or price=0

### 7. Courses by Category (with sorting)
```
GET /api/v1/discovery/category/{categoryId}?sort=popular&limit=20
```
Sort options: popular, rating, newest, price-low, price-high

### 8. Personalized Recommendations (Requires Login)
```
GET /api/v1/discovery/recommended?limit=10
Authorization: Bearer <token>
```
Algorithm: Based on user's purchased courses categories

### 9. Smart Search with Filters
```
GET /api/v1/discovery/search?q=javascript&category=xxx&minPrice=0&maxPrice=100&minRating=4&sort=relevance&limit=20&page=1
```
Sort options: relevance, rating, newest, price-low, price-high, popular

### 10. Course SEO Data (For Google Rich Results)
```
GET /api/v1/discovery/seo/{courseId}
```
Returns:
- JSON-LD structured data for Google
- Meta tags for social sharing (OG, Twitter)
- Canonical URL

## Frontend Integration

### Services (src/services/discoveryService.ts)
- `getHomePageData()` - Fetch all home page sections
- `getTrendingCourses(limit)` - Trending courses
- `getFeaturedCourses(limit)` - Featured courses
- `getNewCourses(limit)` - New courses
- `getBestsellerCourses(limit)` - Bestsellers
- `getFreeCourses(limit)` - Free courses
- `getCoursesByCategory(categoryId, sort, limit)` - Category courses
- `getRecommendedCourses(limit)` - Personalized (auth required)
- `searchCourses(params)` - Advanced search
- `getCourseSEOData(courseId)` - SEO data for a course

### SEO Component (src/components/seo/CourseSEO.tsx)
- Adds meta tags to document head
- Injects JSON-LD structured data for Google
- Supports Open Graph (Facebook, LinkedIn)
- Supports Twitter Cards

### Updated Pages
- **Index.tsx (Home)**: Uses discovery service for featured courses
- **CourseDetailsPage.tsx**: Fetches and applies SEO data

## Google Rich Results Support

The SEO data includes JSON-LD structured data that enables:
- Course rich snippets in Google search
- Aggregate ratings display
- Price and availability info
- Instructor information

Example JSON-LD output:
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Course Title",
  "description": "...",
  "provider": {
    "@type": "Organization",
    "name": "AVinar Academy"
  },
  "instructor": {
    "@type": "Person",
    "name": "Instructor Name"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 100
  },
  "offers": {
    "@type": "Offer",
    "price": 49.99,
    "priceCurrency": "USD"
  }
}
```

## Testing

1. Start the backend server
2. Test API endpoints:
   - `GET http://localhost:8000/api/v1/discovery/home`
   - `GET http://localhost:8000/api/v1/discovery/trending`
   - `GET http://localhost:8000/api/v1/discovery/seo/{courseId}`

3. Use Google's Rich Results Test to validate SEO:
   - https://search.google.com/test/rich-results
