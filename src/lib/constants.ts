export const TASK_STATUS_ORDER: Record<string, number> = {
  assigned: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
  verified: 4,
  closed: 5,
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  verified: 'Verified',
  closed: 'Closed',
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  assigned: '#6366f1',
  accepted: '#8b5cf6',
  in_progress: '#f59e0b',
  completed: '#10b981',
  verified: '#06b6d4',
  closed: '#6b7280',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export const DEPARTMENTS = [
  'Housekeeping',
  'Security',
  'Maintenance',
  'Cleaning',
  'Technical Support',
];

export const TASK_CATEGORIES = [
  'Maintenance',
  'Cleaning',
  'Security',
  'Housekeeping',
  'Technical',
  'General',
];

export const LOCATIONS = [
  'Block A',
  'Block B',
  'Block C',
  'Main Building',
  'Annex',
  'Cafeteria',
  'Parking Area',
  'Garden',
];

export const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin / HR',
  supervisor: 'Supervisor',
  employee: 'Frontline Employee',
};

export const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Task Operations', href: '/tasks', icon: 'ClipboardList' },
    { label: 'Workforce Directory', href: '/employees', icon: 'Users' },
    { label: 'AI Task Matching', href: '/recommendations', icon: 'Brain' },
    { label: 'Human Review Queue', href: '/human-review', icon: 'ShieldCheck' },
    { label: 'Workforce Analytics', href: '/analytics', icon: 'BarChart3' },
    { label: 'Audit Trail', href: '/audit-logs', icon: 'ScrollText' },
    { label: 'Privacy & Security', href: '/privacy-security', icon: 'Lock' },
    { label: 'System Architecture', href: '/research-framework', icon: 'GraduationCap' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  supervisor: [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Task Operations', href: '/tasks', icon: 'ClipboardList' },
    { label: 'Workforce Directory', href: '/employees', icon: 'Users' },
    { label: 'AI Task Matching', href: '/recommendations', icon: 'Brain' },
    { label: 'Workforce Analytics', href: '/analytics', icon: 'BarChart3' },
    { label: 'System Architecture', href: '/research-framework', icon: 'GraduationCap' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  employee: [
    { label: 'My Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Tasks', href: '/tasks', icon: 'ClipboardList' },
    { label: 'System Architecture', href: '/research-framework', icon: 'GraduationCap' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ],
};

// Employee can transition task to these next statuses
export const EMPLOYEE_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  assigned: ['accepted'],
  accepted: ['in_progress'],
  in_progress: ['completed'],
};

// Supervisor/Admin can transition task to these statuses
export const SUPERVISOR_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  assigned: ['accepted'],
  accepted: ['in_progress'],
  in_progress: ['completed'],
  completed: ['verified'],
  verified: ['closed'],
};
