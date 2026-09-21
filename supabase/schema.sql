-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to get user role securely
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'employee')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id),
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  location TEXT,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'on_leave', 'busy')),
  joining_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  supervisor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_employee_id UUID REFERENCES public.employees(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'verified', 'closed')),
  completion_notes TEXT,
  evidence_url TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. task_updates
CREATE TABLE public.task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  updated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ai_recommendations
CREATE TABLE public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recommendation TEXT NOT NULL,
  factors JSONB DEFAULT '{}',
  confidence DECIMAL(3,2) DEFAULT 0.0,
  related_task_id UUID REFERENCES public.tasks(id),
  recommended_employee_id UUID REFERENCES public.employees(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'modified', 'rejected')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ai_insights
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  data_factors JSONB DEFAULT '{}',
  affected_employees UUID[] DEFAULT '{}',
  affected_tasks UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. human_decisions
CREATE TABLE public.human_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES public.ai_recommendations(id),
  insight_id UUID REFERENCES public.ai_insights(id),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'modified', 'rejected')),
  decision_by UUID REFERENCES public.profiles(id),
  decision_reason TEXT,
  modifications TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. audit_logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- Departments Policies
CREATE POLICY "All authenticated users read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Admins update departments" ON public.departments FOR UPDATE TO authenticated USING (get_user_role((SELECT auth.uid())) = 'admin');

-- Employees Policies
CREATE POLICY "Admins and supervisors read employees" ON public.employees FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));
CREATE POLICY "Employees read own record" ON public.employees FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Admins insert employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Admins update employees" ON public.employees FOR UPDATE TO authenticated USING (get_user_role((SELECT auth.uid())) = 'admin');

-- Tasks Policies
CREATE POLICY "Admins read all tasks" ON public.tasks FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Supervisors read created tasks" ON public.tasks FOR SELECT TO authenticated USING (created_by = (SELECT auth.uid()));
CREATE POLICY "Employees read assigned tasks" ON public.tasks FOR SELECT TO authenticated USING (
  assigned_employee_id IN (SELECT id FROM public.employees WHERE user_id = (SELECT auth.uid()))
);
CREATE POLICY "Admins and supervisors insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));
CREATE POLICY "Admins and supervisors update tasks" ON public.tasks FOR UPDATE TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));

-- Task Updates Policies
CREATE POLICY "Admins read all task_updates" ON public.task_updates FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Supervisors read task_updates" ON public.task_updates FOR SELECT TO authenticated USING (
  task_id IN (SELECT id FROM public.tasks WHERE created_by = (SELECT auth.uid()))
);
CREATE POLICY "Employees read assigned task_updates" ON public.task_updates FOR SELECT TO authenticated USING (
  task_id IN (SELECT id FROM public.tasks WHERE assigned_employee_id IN (SELECT id FROM public.employees WHERE user_id = (SELECT auth.uid())))
);
CREATE POLICY "Admins and supervisors insert task_updates" ON public.task_updates FOR INSERT TO authenticated WITH CHECK (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));

-- AI Recommendations Policies
CREATE POLICY "Admins and supervisors read ai_recommendations" ON public.ai_recommendations FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));
CREATE POLICY "Admins and supervisors update ai_recommendations" ON public.ai_recommendations FOR UPDATE TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));

-- AI Insights Policies
CREATE POLICY "Admins and supervisors read ai_insights" ON public.ai_insights FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));

-- Human Decisions Policies
CREATE POLICY "Admins and supervisors read human_decisions" ON public.human_decisions FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));
CREATE POLICY "Admins and supervisors insert human_decisions" ON public.human_decisions FOR INSERT TO authenticated WITH CHECK (get_user_role((SELECT auth.uid())) IN ('admin', 'supervisor'));

-- Audit Logs Policies
CREATE POLICY "Admins read all audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (get_user_role((SELECT auth.uid())) = 'admin');
CREATE POLICY "Supervisors read own audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_department_id ON public.employees(department_id);
CREATE INDEX idx_tasks_assigned_employee_id ON public.tasks(assigned_employee_id);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_task_updates_task_id ON public.task_updates(task_id);
CREATE INDEX idx_ai_recommendations_related_task_id ON public.ai_recommendations(related_task_id);
CREATE INDEX idx_human_decisions_recommendation_id ON public.human_decisions(recommendation_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
