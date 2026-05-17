# AI Backend Architecture Context
## Project Type
Production-ready Ecommerce Backend
---
# Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Cloudinary
Auth:
- JWT Access Token
- JWT Refresh Token
- HTTPOnly Cookie
---
# Architecture
- Modular Monolith
- Feature-based Architecture
- Service Layer Pattern
- Repository Pattern
Flow:
Route
→ Controller
→ Service
→ Repository
→ Database
---
# Core Rules
- Controller handles HTTP only
- Service contains business logic
- Repository handles database queries only
- No direct mongoose access outside repository
- Validation separated from controller
- Shared infrastructure centralized
- Modules isolated by business domain
---
# API Style
- RESTful API
- Base URL: `/api/v1`
Response format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```
---
# Folder Structure
```txt
src/
├── modules/
├── shared/
├── config/
├── database/
├── routes/
├── jobs/
├── queues/
├── tests/
└── app.js
```
---
# Module Structure
```txt
modules/
└── product/
    ├── product.routes.js
    ├── product.controller.js
    ├── product.service.js
    ├── product.repository.js
    ├── product.validation.js
    ├── product.model.js
    └── index.js
```
---
# Shared Structure
```txt
shared/
├── errors/
├── middleware/
├── response/
├── utils/
├── constants/
└── lib/
```
---
# Important Conventions
- Use asyncHandler
- Use centralized AppError
- Use standardized ApiResponse
- Keep naming consistent
- Reuse shared utilities
- Keep modules independent
Forbidden:
- Business logic inside controller
- Validation inside controller
- Raw mongoose queries inside service
- Duplicate query logic
- Monolithic files
---
# AI Coding Goal
Prioritize:
- consistency
- modularity
- scalability
- maintainability
- reusable patterns
- AI readability
Always follow existing architecture and patterns.