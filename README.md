# WorkSync AI — AI-Assisted Workforce Coordination Prototype

> **Academic Research Proof-of-Concept**
>
> "Artificial Intelligence Applications in Human Resource Practices: An Integrated Framework for Frontline Workforce Coordination, HR Analytics and Human-in-the-Loop Governance"

---

## Research Motivation

Organizations employing frontline/operational workers (cleaning staff, housekeeping, security, maintenance, technicians, drivers) face challenges in:

- Coordinating task assignments across distributed teams
- Generating actionable workforce analytics
- Ensuring AI-assisted decisions remain under human oversight
- Maintaining privacy and auditability

This prototype demonstrates a conceptual framework that integrates these concerns into a unified system.

## Research Gap

> "Limited integration of frontline workforce task coordination with AI-enabled HR analytics and decision support under secure Human-in-the-Loop governance."

## Objectives

1. **Demonstrate integrated workflow**: Task coordination → AI analytics → decision support → human review → audit trail
2. **Implement Human-in-the-Loop governance**: AI provides recommendations; humans retain final authority
3. **Show AI explainability**: Every recommendation includes transparent reasoning
4. **Prototype privacy controls**: Role-based access, audit logging, data minimization
5. **Prove concept feasibility**: End-to-end working prototype with realistic demo data

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  Admin/   │  │  Supervisor  │  │  Employee           │ │
│  │  HR UI    │  │  UI          │  │  UI (Mobile-ready)  │ │
│  └──────────┘  └──────────────┘  └────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│             API Layer (Server Actions)                   │
│  Auth │ Employees │ Tasks │ AI │ Review │ Audit         │
├─────────────────────────────────────────────────────────┤
│           AI Engine (Rule-Based, Transparent)            │
│  Task Recommender │ Analytics │ Decision Support        │
├─────────────────────────────────────────────────────────┤
│              Database (Supabase PostgreSQL)               │
│  RLS Policies │ Row-Level Security │ Audit Logs         │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Lucide React icons |
| Charts | Recharts |
| Backend | Next.js Server Actions |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | Row-Level Security (RLS) |

## Database Structure

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts linked to Supabase Auth |
| `departments` | Organizational departments |
| `employees` | Employee records with skills, location, availability |
| `tasks` | Task assignments with full lifecycle tracking |
| `task_updates` | Status change history for audit trail |
| `ai_recommendations` | AI-generated task/workforce recommendations |
| `ai_insights` | AI-generated workforce analytics insights |
| `human_decisions` | Records of human review decisions |
| `audit_logs` | Complete system audit trail |

### Entity Relationships

- Employees belong to departments
- Tasks are assigned to employees and created by supervisors
- AI recommendations reference tasks and employees
- Human decisions link to recommendations/insights
- Audit logs track all system events

## How AI Recommendation Works

### Important Disclaimer

> **All AI features in this prototype use transparent, rule-based algorithms — NOT trained machine learning models.** This is intentional for academic transparency and explainability.

### Task Allocation Recommender

When a supervisor creates a task, the system recommends suitable employees using a **weighted scoring algorithm**:

```
Score = (0.25 × Availability) + (0.25 × Workload) + (0.25 × Skill Match) + (0.15 × Location) + (0.10 × Priority Capacity)
```

**Factors:**

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Availability | 25% | available=1.0, busy=0.3, on_leave=0.0 |
| Workload | 25% | Fewer active tasks = higher score |
| Skill Match | 25% | Task category mapped to required skills |
| Location | 15% | Same zone = 1.0, different = 0.2 |
| Priority Capacity | 10% | Fewer high/urgent tasks = higher score |

### Workforce Analytics Engine

Generates insights using statistical analysis:

- **Workload distribution**: Mean/standard deviation → flag outliers (>1σ)
- **Delay analysis**: Group by category/location → identify patterns
- **Completion trends**: Rolling averages over time windows
- **Imbalance detection**: Coefficient of variation analysis

### Decision Support

Generates actionable recommendations when:

- Workload imbalance detected (CV > 0.3)
- Persistent delays in a category (>30% delayed)
- Under-utilized employees (<50% of average workload)
- Overloaded employees (>150% of average workload)

## Human-in-the-Loop Design

This is a **core feature** of the research framework.

### Principles

1. **AI never makes autonomous HR decisions**
2. **Every AI recommendation requires explicit human approval**
3. **Humans can approve, modify, or reject any recommendation**
4. **All decisions are recorded with reasoning**
5. **Complete audit trail maintained**

### Workflow

```
AI Recommendation
       ↓
Human Review Queue
       ↓
Supervisor/HR Reviews
       ↓
[Approve] [Modify] [Reject]
       ↓
Action Executed
       ↓
Audit Log Recorded
```

### What AI Cannot Do

- ❌ Terminate an employee
- ❌ Penalize an employee
- ❌ Promote an employee
- ❌ Reduce salary
- ❌ Make disciplinary decisions
- ❌ Execute any HR action without human approval

## Privacy & Security Approach

### Implemented Controls (Prototype Level)

- ✅ Authentication (Supabase Auth)
- ✅ Role-based access control (3 roles)
- ✅ Row-level security (database-enforced)
- ✅ Audit logging
- ✅ Data minimization
- ✅ Sensitive field protection

### Disclaimer

> Prototype-level privacy and access controls are implemented. Formal regulatory compliance (GDPR, DPDP Act, ISO 27001) requires further organizational and legal validation.

## How to Run Locally

### Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm
- A Supabase account (free tier: https://supabase.com)

### Step 1: Clone / Download

```bash
cd hr-ai-prototype
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** and copy your:
   - Project URL
   - Anon (public) key
3. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`

### Step 4: Set Up Database

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the contents of `supabase/schema.sql` (creates tables, indexes, RLS policies)
3. Run the contents of `supabase/seed.sql` (inserts demo data)

### Step 5: Create Demo Users

In Supabase Dashboard → **Authentication** → **Users**, create:

| Email | Password | Note |
|-------|----------|------|
| admin@demo.com | demo1234 | Admin/HR user |
| supervisor@demo.com | demo1234 | Supervisor user |
| employee@demo.com | demo1234 | Frontline Employee |

Then in the SQL Editor, link these auth users to profiles:

```sql
-- After creating users in Auth, get their UUIDs and run:
INSERT INTO profiles (id, email, full_name, role)
VALUES
  ('<admin-auth-uuid>', 'admin@demo.com', 'HR Admin', 'admin'),
  ('<supervisor-auth-uuid>', 'supervisor@demo.com', 'Site Supervisor', 'supervisor'),
  ('<employee-auth-uuid>', 'employee@demo.com', 'Rajesh Kumar', 'employee');
```

### Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / HR | admin@demo.com | demo1234 |
| Supervisor | supervisor@demo.com | demo1234 |
| Employee | employee@demo.com | demo1234 |

## Demo Workflow

The following end-to-end workflow demonstrates the research concept:

1. **Login as Supervisor** → Create a maintenance task
2. **AI recommends** a suitable employee with explanation
3. **Supervisor reviews** the recommendation and approves
4. **Login as Employee** → Accept the assigned task
5. **Employee starts** and completes the task with notes
6. **Login as Supervisor** → Verify the completed task
7. **View Analytics** → AI generates workforce insights
8. **View Recommendations** → Review AI suggestions
9. **Human Review** → Approve/reject recommendations
10. **Audit Logs** → Verify complete trail of actions

## Limitations

This is an **academic proof-of-concept** with known limitations:

1. **AI is rule-based**: No trained ML models; uses weighted scoring and statistical analysis
2. **Limited scale**: Designed for demo scenarios with 20 employees and 30 tasks
3. **No production hardening**: Missing rate limiting, advanced error handling, comprehensive input validation
4. **Single-tenant**: No multi-organization support
5. **No real-time updates**: Page refresh required for data updates
6. **Simplified analytics**: Basic statistical methods, not advanced predictive models
7. **No mobile app**: Web-based responsive UI only
8. **Demo authentication**: Simple email/password auth for prototype
9. **No file uploads**: Evidence/photo upload not implemented in prototype
10. **No automated testing**: Manual verification only

## Future Development

Potential enhancements for a production system:

- Integration with trained ML models for more accurate recommendations
- Real-time notifications and updates via WebSockets
- Mobile native applications for frontline workers
- Advanced predictive analytics and forecasting
- Multi-tenant architecture
- Compliance framework integration (GDPR, DPDP Act)
- Biometric attendance integration
- IoT sensor integration for automated task detection
- Natural language processing for task descriptions
- Advanced reporting and export capabilities

## Academic Boundaries

This prototype:

- ✅ Demonstrates AI-assisted decision support
- ✅ Shows human-in-the-loop governance
- ✅ Provides transparent, explainable AI reasoning
- ❌ Does NOT claim AI replaces HR professionals
- ❌ Does NOT claim AI independently evaluates employees
- ❌ Does NOT claim AI makes final HR decisions
- ❌ Does NOT claim AI guarantees unbiased decisions
- ❌ Does NOT claim scientific validation without experimental evidence

---

**This is an academic research prototype. It demonstrates a conceptual framework and should not be used as a production HR management system without significant further development, testing, and compliance validation.**
