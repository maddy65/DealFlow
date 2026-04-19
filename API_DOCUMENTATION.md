# DealFlow API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

System endpoints require API key:
```
x-system-api-key: <your-system-api-key>
```

---

## Two Workflows

### Workflow 1: Signup Page (Easiest)
1. Go to frontend signup page
2. Fill form: Full name, Workspace name, Email, Password
3. Creates tenant + user (TENANT_ADMIN) automatically
4. Redirected to dashboard

### Workflow 2: Backend API (For custom integrations)
1. Create tenant via `POST /api/tenants` (requires system API key)
2. Create admin user with the tenant
3. Users login with `POST /api/auth/login`

---

## Auth Endpoints

### POST /api/auth/signup
Create account + workspace (Frontend signup)

**Request:**
```json
{
  "name": "John Doe",
  "workspaceName": "My Company",
  "email": "john@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "name": "John Doe",
    "email": "john@company.com",
    "role": "TENANT_ADMIN"
  },
  "tenant": {
    "id": "507f1f77bcf86cd799439011",
    "name": "My Company",
    "slug": "my-company-1234567890"
  }
}
```

---

### POST /api/auth/login
Login to an existing account

**Request:**
```json
{
  "email": "john@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "name": "John Doe",
    "email": "john@company.com",
    "role": "TENANT_ADMIN"
  }
}
```

---

## Tenant Endpoints

### POST /api/tenants
Create a new tenant (System Admin Only)

**Headers:**
```
x-system-api-key: your-system-api-key
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "license": {
    "plan": "PRO",
    "maxUsers": 50,
    "maxLeads": 10000
  },
  "admin": {
    "name": "Alice Admin",
    "email": "alice@acme.com",
    "password": "securePassword123"
  }
}
```

**Response:**
```json
{
  "tenant": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "license": {
      "plan": "PRO",
      "maxUsers": 50,
      "maxLeads": 10000
    },
    "status": "ACTIVE"
  },
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Alice Admin",
    "email": "alice@acme.com",
    "role": "TENANT_ADMIN"
  }
}
```

---

### GET /api/tenants
Get current tenant details (Tenant Admin Only)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "license": {
    "plan": "PRO",
    "maxUsers": 50,
    "maxLeads": 10000
  },
  "status": "ACTIVE"
}
```

---

## User Endpoints

### GET /api/users
List all users in current tenant

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "name": "Alice Admin",
    "email": "alice@acme.com",
    "role": "TENANT_ADMIN",
    "status": "ACTIVE"
  },
  {
    "name": "Bob Manager",
    "email": "bob@acme.com",
    "role": "MANAGER",
    "status": "ACTIVE"
  }
]
```

---

### POST /api/users
Create a new user (Tenant Admin Only)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Bob Manager",
  "email": "bob@acme.com",
  "password": "bobPassword123",
  "role": "MANAGER"
}
```

**Roles:** `TENANT_ADMIN`, `MANAGER`, `USER`

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Bob Manager",
  "email": "bob@acme.com",
  "role": "MANAGER"
}
```

---

### PATCH /api/users/:id
Update user role/status/name (Tenant Admin Only)

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "role": "USER",
  "status": "DISABLED",
  "name": "Bob User"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "name": "Bob User",
  "email": "bob@acme.com",
  "role": "USER",
  "status": "DISABLED"
}
```

---

## Lead Endpoints

### GET /api/leads
Get all leads for current tenant

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Tech Corp",
    "source": "Referral",
    "status": "NEW",
    "priority": "HIGH",
    "score": 85,
    "createdAt": "2026-04-19T10:00:00.000Z"
  }
]
```

---

### POST /api/leads
Create a new lead

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "StartUp Inc",
  "source": "LinkedIn",
  "status": "NEW",
  "priority": "MEDIUM",
  "score": 50
}
```

**Status:** `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`
**Priority:** `LOW`, `MEDIUM`, `HIGH`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "tenantId": "507f1f77bcf86cd799439011",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "company": "StartUp Inc",
  "source": "LinkedIn",
  "status": "NEW",
  "priority": "MEDIUM",
  "score": 50,
  "createdAt": "2026-04-19T10:05:00.000Z"
}
```

---

### PUT /api/leads/:id
Update a lead

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "CONTACTED",
  "priority": "HIGH",
  "score": 75
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "status": "CONTACTED",
  "priority": "HIGH",
  "score": 75
}
```

---

### DELETE /api/leads/:id
Delete a lead (soft delete)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** 204 No Content

---

## Workflow Endpoints

### GET /api/workflow/rules
Get all workflow rules for current tenant

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "trigger": "LEAD_CREATED",
    "condition": {},
    "actions": [
      { "type": "assign_to_user", "userId": "507f1f77bcf86cd799439013" }
    ],
    "isActive": true
  }
]
```

---

### POST /api/workflow/rules
Create a new workflow rule

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "trigger": "LEAD_CREATED",
  "condition": {},
  "actions": [
    {
      "type": "assign_to_user",
      "userId": "507f1f77bcf86cd799439013"
    }
  ],
  "isActive": true
}
```

**Triggers:** `LEAD_CREATED`, `STATUS_CHANGED`

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "tenantId": "507f1f77bcf86cd799439011",
  "trigger": "LEAD_CREATED",
  "actions": [...],
  "isActive": true
}
```

---

### GET /api/workflow/jobs
Get all workflow jobs (execution history)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "ruleId": "507f1f77bcf86cd799439016",
    "leadId": "507f1f77bcf86cd799439015",
    "status": "DONE",
    "attempts": 1,
    "createdAt": "2026-04-19T10:05:00.000Z"
  }
]
```

---

## Setup Steps

### 1. Set Environment Variables
```bash
# backend/.env
MONGO_URI=mongodb+srv://maddyraj65:hKYsxxNRuYZI0QnN@cluster0.c90hm.mongodb.net/dealflow
JWT_SECRET=your-super-secret-jwt-key-change-this
SYSTEM_API_KEY=your-system-api-key-for-backend
PORT=4000
```

### 2. Start Backend & Frontend
```bash
# Terminal 1: Backend
cd backend && npm run start

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Choose Your Setup

**Option A: Signup Page (Recommended for Users)**
- Go to `http://localhost:5174`
- Click "Sign up"
- Fill in: Full name, Workspace name, Email, Password
- Creates tenant + user automatically
- Redirected to dashboard

**Option B: Backend API (For Admin/System)**
```bash
# Create tenant
curl -X POST http://localhost:4000/api/tenants \
  -H "Content-Type: application/json" \
  -H "x-system-api-key: your-system-api-key" \
  -d '{
    "name": "Acme Corp",
    "admin": {
      "name": "Alice",
      "email": "alice@acme.com",
      "password": "password123"
    }
  }'
```

Then users can login with their email/password.

---

## Summary

| Role | Can Do |
|------|--------|
| **TENANT_ADMIN** | Create/manage users, view leads, create workflows, manage tenant |
| **MANAGER** | Create/manage leads, view workflows |
| **USER** | Create/view leads |

---
