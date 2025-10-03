# MOOC2 - Fullstack Training Project Architecture

## Database Schema Design

### Core Tables

```
users (từ MOOC1)
├── id, username, email, password
├── fullname, phone, avatarurl
├── role (admin/user), isactive
└── createdat, updatedat

categories (MOOC2 mới)
├── id, name, description
├── created_at, updated_at
└── Mục đích: Phân loại nội dung

posts (MOOC2 mới)
├── id, title, content
├── user_id → users(id)
├── category_id → categories(id)
├── is_published, published_at
└── created_at, updated_at
```

### Relationships

```
Users (1) ←→ (Many) Posts
Categories (1) ←→ (Many) Posts
```

## Use Cases cho MOOC2

### 1. **Content Management System (CMS)**

- **Admin Dashboard**: Quản lý users, categories, posts
- **User Portal**: Users tạo và quản lý bài viết của mình
- **Public Blog**: Hiển thị published posts theo category

### 2. **Advanced Backend Features**

- **LINQ Queries**:

  ```csharp
  // Get posts with user and category info
  var posts = context.Posts
    .Include(p => p.User)
    .Include(p => p.Category)
    .Where(p => p.IsPublished)
    .OrderByDescending(p => p.PublishedAt);

  // Get posts count by category
  var stats = context.Categories
    .Select(c => new {
      Category = c.Name,
      PostCount = c.Posts.Count(p => p.IsPublished)
    });
  ```

- **Transactions**:
  ```csharp
  // Publish multiple posts atomically
  using var transaction = context.Database.BeginTransaction();
  // Update posts + log actions
  transaction.Commit();
  ```

### 3. **Frontend Features**

- **Dashboard với State Management**: Redux cho manage posts/categories
- **Material-UI Components**:
  - DataGrid cho posts listing
  - Forms cho create/edit posts
  - Categories selector dropdown
- **Advanced UI**:
  - Rich text editor cho post content
  - Image upload cho posts
  - Search và filtering

### 4. **API Endpoints Planning**

```
/api/posts
├── GET / (pagination, filter by category/user)
├── POST / (create new post)
├── PUT /{id} (update post)
├── DELETE /{id} (delete post)
└── GET /{id} (get single post with relations)

/api/categories
├── GET / (all categories with post counts)
├── POST / (admin only - create category)
└── GET /{id}/posts (posts in category)

/api/users/{userId}/posts (user's posts)
```

## Learning Objectives

### Backend (ASP.NET Core + EF Core)

- [x] **EF Migrations**: Schema versioning
- [ ] **Advanced LINQ**: Complex queries, joins
- [ ] **Transactions**: Data consistency
- [ ] **API Pagination**: Performance optimization
- [ ] **Authorization**: Role-based access

### Frontend (React + Material-UI)

- [ ] **State Management**: Redux/Context API
- [ ] **Component Library**: Material-UI integration
- [ ] **Forms**: Advanced validation
- [ ] **Data Tables**: Sorting, filtering, pagination

### Database (PostgreSQL)

- [x] **Foreign Keys**: Referential integrity
- [ ] **Indexes**: Query performance
- [ ] **Stored Procedures**: Complex business logic
- [ ] **Views**: Data abstraction

## Real-world Application

Các bảng này mô phỏng một **Blog/CMS system** phổ biến:

- **Startup/Company blogs**: Technical articles by categories
- **Learning platforms**: Courses/lessons organization
- **News websites**: Articles by topics
- **Documentation sites**: Guides by categories

Đây là foundation cho việc học **enterprise-level development patterns**.
