# Frontend Tech Stack
- React + Vite
- TypeScript
- React Router DOM
- Axios
- Redux Toolkit
- TanStack Query
- React Hook Form
- Zod
- Ant Design
# Frontend Architecture
- Feature-based architecture
- Frontend separated from backend via REST API
- Centralized Axios instance with interceptors
- Route-level lazy loading
- Reusable shared components
- Absolute imports using @ alias
# Folder Structure
src/
│
├── app/
│   ├── store.ts
│   ├── providers.tsx
│   └── App.tsx
│
├── routes/
│
├── pages/
│
├── components/
│
├── features/
│   ├── auth/
│   │   ├── authApi.ts
│   │   ├── authSlice.ts
│   │   ├── authSelectors.ts
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── cars/
│   └── cart/
│
├── services/
│   └── axios.ts
│
├── hooks/
│
├── layouts/
│
├── assets/
│
├── types/
│
├── utils/
│
├── constants/
│
└── styles/
# State Management
- Redux Toolkit for global app state
- TanStack Query for server state
- Local state only for UI/component logic
# API Rules
- No direct axios calls inside components
- API calls handled inside feature modules
- Shared Axios instance inside services/axios.ts
- Token attached via Axios interceptor
- Centralized error handling
# Forms & Validation
- React Hook Form for form handling
- Zod for schema validation
# Routing & Auth
- Protected routes for authenticated users
- Role-based UI rendering
- Route-level lazy loading
# Component Rules
- Shared reusable UI inside components/
- Feature-specific UI stays inside feature folders
- Keep components modular and reusable
- Avoid large components
# Naming Convention
- PascalCase for components/pages/layouts
- camelCase for hooks/utils/functions
- Feature-based naming
# Environment
- Environment variables via Vite env
- API base URL stored in .env
# General Rules
- Prefer reusable components
- Keep business logic outside UI components
- Avoid duplicated API logic
- Keep folder structure consistent
- Use TypeScript types/interfaces consistently