-- Seed Data for HR AI Prototype

-- Departments (5)
DO $$
DECLARE
  dept_hk UUID := '11111111-1111-1111-1111-111111111111';
  dept_sec UUID := '22222222-2222-2222-2222-222222222222';
  dept_main UUID := '33333333-3333-3333-3333-333333333333';
  dept_cln UUID := '44444444-4444-4444-4444-444444444444';
  dept_tech UUID := '55555555-5555-5555-5555-555555555555';

  -- Employees
  emp_uuid_base TEXT := 'a0000000-0000-0000-0000-0000000000';
  
  -- Tasks
  task_uuid_base TEXT := 'b0000000-0000-0000-0000-0000000000';
  
  -- Misc
  rec_uuid_base TEXT := 'c0000000-0000-0000-0000-0000000000';
  ins_uuid_base TEXT := 'd0000000-0000-0000-0000-0000000000';

BEGIN
  -- 1. Insert Departments
  INSERT INTO public.departments (id, name, description) VALUES
    (dept_hk, 'Housekeeping', 'Hotel and room housekeeping operations'),
    (dept_sec, 'Security', 'Building security and patrol'),
    (dept_main, 'Maintenance', 'General repair and building maintenance'),
    (dept_cln, 'Cleaning', 'Sanitation and general cleaning'),
    (dept_tech, 'Technical Support', 'IT and electrical support')
  ON CONFLICT (name) DO NOTHING;

  -- 2. Profiles Note: Profiles are managed via Supabase Auth signup.
  -- In a real scenario, we would seed Auth and let the trigger create profiles, 
  -- or insert mock profiles for testing manually, but without auth they can't login easily.
  -- We leave them out here.

  -- 3. Insert Employees (20)
  INSERT INTO public.employees (id, employee_id, name, email, phone, department_id, role, skills, location, availability, status) VALUES
    ((emp_uuid_base || '01')::UUID, 'EMP-101', 'Aarav Sharma', 'aarav.sharma@example.com', '9876543201', dept_hk, 'Housekeeper', ARRAY['cleaning', 'bed_making'], 'Block A', 'available', 'active'),
    ((emp_uuid_base || '02')::UUID, 'EMP-102', 'Vihaan Patel', 'vihaan.p@example.com', '9876543202', dept_hk, 'Housekeeper', ARRAY['cleaning', 'laundry'], 'Block B', 'busy', 'active'),
    ((emp_uuid_base || '03')::UUID, 'EMP-103', 'Vivaan Kumar', 'vivaan.k@example.com', '9876543203', dept_hk, 'Supervisor', ARRAY['management', 'cleaning'], 'Block A', 'available', 'active'),
    ((emp_uuid_base || '04')::UUID, 'EMP-104', 'Ananya Singh', 'ananya.s@example.com', '9876543204', dept_hk, 'Housekeeper', ARRAY['cleaning', 'room_service'], 'Block C', 'on_leave', 'on_leave'),
    
    ((emp_uuid_base || '05')::UUID, 'EMP-105', 'Diya Reddy', 'diya.r@example.com', '9876543205', dept_sec, 'Security Guard', ARRAY['patrol', 'cctv_monitoring'], 'Main Building', 'busy', 'active'),
    ((emp_uuid_base || '06')::UUID, 'EMP-106', 'Advik Gupta', 'advik.g@example.com', '9876543206', dept_sec, 'Security Guard', ARRAY['patrol', 'first_aid'], 'Annex', 'available', 'active'),
    ((emp_uuid_base || '07')::UUID, 'EMP-107', 'Myra Desai', 'myra.d@example.com', '9876543207', dept_sec, 'Head Guard', ARRAY['management', 'cctv_monitoring'], 'Main Building', 'available', 'active'),
    ((emp_uuid_base || '08')::UUID, 'EMP-108', 'Reyansh Joshi', 'reyansh.j@example.com', '9876543208', dept_sec, 'Security Guard', ARRAY['patrol'], 'Block A', 'busy', 'active'),

    ((emp_uuid_base || '09')::UUID, 'EMP-109', 'Kian Nair', 'kian.n@example.com', '9876543209', dept_main, 'Plumber', ARRAY['plumbing', 'welding'], 'Block A', 'available', 'active'),
    ((emp_uuid_base || '10')::UUID, 'EMP-110', 'Dhruv Menon', 'dhruv.m@example.com', '9876543210', dept_main, 'Electrician', ARRAY['electrical', 'wiring'], 'Block B', 'busy', 'active'),
    ((emp_uuid_base || '11')::UUID, 'EMP-111', 'Ayaan Pillai', 'ayaan.p@example.com', '9876543211', dept_main, 'Carpenter', ARRAY['carpentry'], 'Block C', 'available', 'active'),
    ((emp_uuid_base || '12')::UUID, 'EMP-112', 'Isha Iyer', 'isha.i@example.com', '9876543212', dept_main, 'Technician', ARRAY['hvac', 'electrical'], 'Main Building', 'available', 'active'),

    ((emp_uuid_base || '13')::UUID, 'EMP-113', 'Arjun Kapoor', 'arjun.k@example.com', '9876543213', dept_cln, 'Cleaner', ARRAY['deep_cleaning', 'floor_care'], 'Annex', 'busy', 'active'),
    ((emp_uuid_base || '14')::UUID, 'EMP-114', 'Sara Khan', 'sara.k@example.com', '9876543214', dept_cln, 'Cleaner', ARRAY['window_cleaning', 'deep_cleaning'], 'Block A', 'available', 'active'),
    ((emp_uuid_base || '15')::UUID, 'EMP-115', 'Rohan Das', 'rohan.d@example.com', '9876543215', dept_cln, 'Cleaner', ARRAY['waste_management', 'floor_care'], 'Block B', 'on_leave', 'on_leave'),
    ((emp_uuid_base || '16')::UUID, 'EMP-116', 'Mira Sen', 'mira.s@example.com', '9876543216', dept_cln, 'Cleaner', ARRAY['deep_cleaning'], 'Block C', 'available', 'active'),

    ((emp_uuid_base || '17')::UUID, 'EMP-117', 'Kabir Verma', 'kabir.v@example.com', '9876543217', dept_tech, 'IT Support', ARRAY['networking', 'hardware'], 'Main Building', 'available', 'active'),
    ((emp_uuid_base || '18')::UUID, 'EMP-118', 'Zara Ali', 'zara.a@example.com', '9876543218', dept_tech, 'Network Admin', ARRAY['networking', 'security'], 'Main Building', 'busy', 'active'),
    ((emp_uuid_base || '19')::UUID, 'EMP-119', 'Aryan Bose', 'aryan.b@example.com', '9876543219', dept_tech, 'IT Support', ARRAY['software_support', 'hardware'], 'Annex', 'available', 'active'),
    ((emp_uuid_base || '20')::UUID, 'EMP-120', 'Riya Choudhury', 'riya.c@example.com', '9876543220', dept_tech, 'System Admin', ARRAY['server_management', 'networking'], 'Block A', 'available', 'active')
  ON CONFLICT (employee_id) DO NOTHING;

  -- 4. Insert Tasks (30)
  FOR i IN 1..30 LOOP
    INSERT INTO public.tasks (id, task_id, title, description, category, location, priority, assigned_employee_id, due_date, status)
    VALUES (
      (task_uuid_base || lpad(i::TEXT, 2, '0'))::UUID,
      'T-10' || lpad(i::TEXT, 2, '0'),
      'Task ' || i,
      'Description for task ' || i,
      CASE i % 5 WHEN 0 THEN 'Housekeeping' WHEN 1 THEN 'Security' WHEN 2 THEN 'Maintenance' WHEN 3 THEN 'Cleaning' ELSE 'Technical' END,
      CASE i % 3 WHEN 0 THEN 'Block A' WHEN 1 THEN 'Block B' ELSE 'Main Building' END,
      CASE i % 4 WHEN 0 THEN 'low' WHEN 1 THEN 'medium' WHEN 2 THEN 'high' ELSE 'urgent' END,
      (emp_uuid_base || lpad(((i % 20) + 1)::TEXT, 2, '0'))::UUID,
      CURRENT_TIMESTAMP + (i || ' hours')::INTERVAL,
      CASE 
        WHEN i <= 5 THEN 'assigned'
        WHEN i <= 10 THEN 'accepted'
        WHEN i <= 15 THEN 'in_progress'
        WHEN i <= 23 THEN 'completed'
        WHEN i <= 27 THEN 'verified'
        ELSE 'closed'
      END
    );
  END LOOP;

  -- 5. Insert task_updates (sample)
  INSERT INTO public.task_updates (task_id, previous_status, new_status, notes) VALUES
    ((task_uuid_base || '06')::UUID, 'assigned', 'accepted', 'Employee accepted task'),
    ((task_uuid_base || '11')::UUID, 'accepted', 'in_progress', 'Started working'),
    ((task_uuid_base || '16')::UUID, 'in_progress', 'completed', 'Finished earlier than expected');

  -- 6. Insert ai_recommendations (8)
  INSERT INTO public.ai_recommendations (id, type, title, recommendation, factors, confidence, status, related_task_id, recommended_employee_id) VALUES
    ((rec_uuid_base || '01')::UUID, 'task_assignment', 'Assign Leak Repair', 'Assign to Kian Nair (Plumber)', '{"availability": true, "skill_match": true, "location_match": true}', 0.95, 'pending', (task_uuid_base || '01')::UUID, (emp_uuid_base || '09')::UUID),
    ((rec_uuid_base || '02')::UUID, 'task_assignment', 'Assign AC Fix', 'Assign to Isha Iyer (Technician)', '{"availability": true, "skill_match": true, "current_workload": 1}', 0.88, 'pending', (task_uuid_base || '02')::UUID, (emp_uuid_base || '12')::UUID),
    ((rec_uuid_base || '03')::UUID, 'task_assignment', 'Assign Network Reset', 'Assign to Kabir Verma (IT Support)', '{"availability": true, "skill_match": true}', 0.92, 'pending', (task_uuid_base || '03')::UUID, (emp_uuid_base || '17')::UUID),
    ((rec_uuid_base || '04')::UUID, 'workload_rebalance', 'Rebalance Housekeeping', 'Shift 2 tasks from Aarav to Vivaan', '{"avg_workload": 4.5, "target_workload": 2}', 0.85, 'pending', NULL, NULL),
    ((rec_uuid_base || '05')::UUID, 'workload_rebalance', 'Rebalance Security', 'Move patrol to Advik', '{"avg_workload": 5.0}', 0.78, 'pending', NULL, NULL),
    ((rec_uuid_base || '06')::UUID, 'task_assignment', 'Assign Deep Cleaning', 'Assign to Sara Khan', '{"availability": true}', 0.91, 'approved', (task_uuid_base || '04')::UUID, (emp_uuid_base || '14')::UUID),
    ((rec_uuid_base || '07')::UUID, 'workload_rebalance', 'Rebalance Tech', 'Shift tasks', '{"avg_workload": 6.0}', 0.65, 'rejected', NULL, NULL),
    ((rec_uuid_base || '08')::UUID, 'schedule_optimization', 'Optimize Main Building', 'Delay non-urgent tasks', '{"priority_distribution": "skewed"}', 0.89, 'modified', NULL, NULL);

  -- 7. Insert ai_insights (6)
  INSERT INTO public.ai_insights (id, category, title, description, severity, data_factors, affected_employees) VALUES
    ((ins_uuid_base || '01')::UUID, 'workload', 'High Workload in Housekeeping', 'Housekeeping staff are operating at 120% capacity.', 'warning', '{"capacity": 1.2}', ARRAY[(emp_uuid_base || '01')::UUID, (emp_uuid_base || '02')::UUID]),
    ((ins_uuid_base || '02')::UUID, 'workload', 'Uneven Security Shifts', 'Security department has unbalanced workload across shifts.', 'warning', '{"balance_score": 0.4}', ARRAY[(emp_uuid_base || '05')::UUID]),
    ((ins_uuid_base || '03')::UUID, 'delay', 'Maintenance Tasks Delayed', 'Average completion time for maintenance tasks increased by 20%.', 'warning', '{"delay_increase": 0.2}', '{}'),
    ((ins_uuid_base || '04')::UUID, 'availability', 'Low Tech Availability', 'Only 1 tech support available this afternoon.', 'info', '{"available_count": 1}', '{}'),
    ((ins_uuid_base || '05')::UUID, 'performance', 'Excellent Cleaning Turnaround', 'Cleaning staff completing tasks 15% faster.', 'info', '{"speed_increase": 0.15}', '{}'),
    ((ins_uuid_base || '06')::UUID, 'pattern', 'Recurring HVAC Issues', 'Multiple HVAC failure reports in Main Building.', 'critical', '{"failure_count": 5}', '{}');

  -- 8. Insert human_decisions (4)
  INSERT INTO public.human_decisions (recommendation_id, insight_id, decision, decision_reason, modifications) VALUES
    ((rec_uuid_base || '06')::UUID, NULL, 'approved', 'Sara is best suited for deep cleaning', NULL),
    ((rec_uuid_base || '07')::UUID, NULL, 'rejected', 'Tech team can handle the load', NULL),
    ((rec_uuid_base || '08')::UUID, NULL, 'modified', 'Only delay low priority tasks', 'Exempted medium priority'),
    (NULL, (ins_uuid_base || '01')::UUID, 'approved', 'Acknowledged insight, looking into hiring', NULL);

  -- 9. Insert audit_logs (15)
  FOR i IN 1..15 LOOP
    INSERT INTO public.audit_logs (action, entity_type, description) VALUES
      ('UPDATE', 'tasks', 'Task ' || i || ' status updated to ' || CASE i % 3 WHEN 0 THEN 'completed' WHEN 1 THEN 'in_progress' ELSE 'accepted' END);
  END LOOP;

END $$;
