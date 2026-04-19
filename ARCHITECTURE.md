# DealFlow CRM - Complete Architecture & API Documentation

## System Architecture

### Database Models
1. **Tenant** - Workspace/Organization
2. **User** - Team members (Role: TENANT_ADMIN, MANAGER, USER)
3. **Stage** - Configurable lead pipeline stages
4. **Lead** - Sales leads with pipeline tracking
5. **Task** - Actions associated with leads
6. **LeadActivity** - Activity log for leads
7. **WorkflowRule** - Automation rules
8. **WorkflowJob** - Workflow execution history

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **TENANT_ADMIN** | Full tenant access, manage users, manage stages, view all leads/tasks |
| **MANAGER** | Create/manage team leads, assign tasks, view team performance |
| **USER** | Manage own leads, view own tasks, create activities |

### URL Structure & Key Features

```
GET    /api/dashboard/summary           - Dashboard overview
GET    /api/dashboard/today-tasks       - Today's task list
GET    /api/dashboard/overdue-tasks     - Overdue tasks
GET    /api/dashboard/leads-by-stage    - Kanban pipeline view
POST   /api/dashboard/assign-task       - Assign task to user

GET    /api/stages                      - List pipeline stages
POST   /api/stages                      - Create new stage (Admin only)
PATCH  /api/stages/:id                  - Update stage (Admin only)
DELETE /api/stages/:id                  - Delete stage (Admin only)

GET    /api/tasks/lead/:leadId          - Get tasks for a lead
GET    /api/tasks/my-tasks              - Get assigned tasks
POST   /api/tasks                       - Create task
PATCH  /api/tasks/:id                   - Update task status/details
DELETE /api/tasks/:id                   - Delete task

GET    /api/leads                       - Get all leads
POST   /api/leads                       - Create lead
PUT    /api/leads/:id                   - Update lead
DELETE /api/leads/:id                   - Delete lead (soft delete)
```

---

## Frontend UI Architecture

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Sidebar (280px)  │   Main Content      │
│  ┌─────────────┐  │  ┌───────────────┐  │
│  │ Dashboard   │  │  │               │  │
│  │ Pipeline    │  │  │   Current     │  │
│  │ My Tasks    │  │  │   View        │  │
│  │ All Leads   │  │  │               │  │
│  │ Team        │  │  │               │  │
│  │ Settings    │  │  └───────────────┘  │
│  └─────────────┘  │                     │
└─────────────────────────────────────────┘
```

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#68d391)
- **Warning**: Orange (#f6ad55)
- **Danger**: Red (#fc8181)
- **Background**: Light gray (#f5f7fa)
- **Cards**: White with subtle shadows

### Views

**Dashboard**
- Summary stats (total leads, tasks, overdue count)
- Today's tasks list
- Overdue tasks notification

**Pipeline (Kanban)**
- Stages as columns (New → Attempted → Connected → Qualified → Proposal → Won/Lost)
- Leads as draggable cards
- Color-coded by priority
- Stage-based filtering

**My Tasks**
- Filterable task list (All, Pending, Completed, Overdue)
- Task type, due date, priority, status
- Quick status update

**All Leads**
- Complete lead listing
- Company, contact info, priority
- Sortable & filterable

**Team** (Admin only)
- List all team members
- Roles and status
- Management capabilities

**Settings** (Admin only)
- Create/edit pipeline stages
- Color picker for stages
- Stage ordering

---

## Setup & Deployment

### 1. Environment Variables

```env
# backend/.env
MONGO_URI=mongodb+srv://maddyraj65:hKYsxxNRuYZI0QnN@cluster0.c90hm.mongodb.net/dealflow
JWT_SECRET=your-super-secret-jwt-key
SYSTEM_API_KEY=your-system-api-key
PORT=4000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 2. Start Services

```bash
# Terminal 1: Backend
cd backend && npm run start

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. First Time Setup
Create default pipeline stages after first admin signup:
- Go to Settings
- Create stages: New, Attempted, Connected, Qualified, Proposal, Won, Lost

---

## Key Features Implemented

✅ **Multi-tenant support** - Isolated workspaces per organization
✅ **Configurable pipeline stages** - Dynamic lead lifecycle
✅ **Task management** - Create/assign/track tasks per lead
✅ **Role-based access** - Admin, Manager, User roles with permissions
✅ **Dashboard analytics** - Summary stats, today's tasks, overdue alerts
✅ **Kanban pipeline view** - Visual lead management by stage
✅ **Modern UI** - Left sidebar navigation, center content area
✅ **Activity tracking** - Log all lead changes
✅ **User management** - Create teams and manage roles

---

## Coming Soon

- [ ] Cron job service for SLA monitoring (mark stale leads)
- [ ] Email notifications for overdue tasks
- [ ] Lead drag & drop between stages
- [ ] Advanced filtering & search
- [ ] Export to CSV
- [ ] Lead scoring & prediction
- [ ] Mobile responsive improvements
- [ ] API rate limiting
- [ ] Audit logs
- [ ] Custom field support

---

## API Examples

### Create a Stage
```bash
curl -X POST http://localhost:4000/api/stages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "name": "Proposal",
    "color": "#7c3aed",
    "order": 5
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "leadId": "<lead-id>",
    "title": "Follow up call",
    "taskType": "CALL",
    "priority": "HIGH",
    "dueDate": "2026-04-20T15:00:00Z"
  }'
```

### Get Dashboard Summary
```bash
curl http://localhost:4000/api/dashboard/summary \
  -H "Authorization: Bearer <jwt-token>"
```

### Get Leads by Stage
```bash
curl http://localhost:4000/api/dashboard/leads-by-stage \
  -H "Authorization: Bearer <jwt-token>"
```

---
