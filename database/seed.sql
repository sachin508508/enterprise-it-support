-- Enterprise IT Support Platform
-- Demo seed data
-- Credentials, conversations, and HITL requests are intentionally excluded.

-- ============================================================
-- EMPLOYEES
-- ============================================================

INSERT INTO public.employees (
    employee_id,
    name,
    email,
    department,
    job_title,
    role,
    availability_status,
    manager_id,
    employment_status
) VALUES
(
    'EMP001',
    'Arun',
    'arun@company.com',
    'IT',
    'Software Developer',
    'Employee',
    'active_project',
    NULL,
    'active'
),
(
    'EMP002',
    'Keerthi',
    'ravi@company.com',
    'IT',
    'Software Developer',
    'Manager',
    'bench',
    'EMP001',
    'active'
),
(
    'EMP003',
    'Asika',
    'priya@company.com',
    'Project Management',
    'Project Manager',
    'Manager',
    'active_project',
    NULL,
    'active'
),
(
    'EMP004',
    'Diwakar',
    'karthik@company.com',
    'QA',
    'QA Engineer',
    'Employee',
    'active_project',
    'EMP003',
    'active'
),
(
    'EMP005',
    'Sachin',
    'divya@company.com',
    'IT Support',
    'IT Support Engineer',
    'Admin',
    'inactive',
    NULL,
    'active'
);

-- ============================================================
-- EMPLOYEE CONFIGURATIONS
-- ============================================================

INSERT INTO public.employee_configurations (
    configuration_id,
    employee_id,
    device_type,
    device_name,
    os,
    os_version,
    vpn_enabled,
    mfa_enabled,
    last_seen_at,
    updated_at
) VALUES
(
    'd69b9c70-556f-4cfb-99ce-f58718582b44',
    'EMP001',
    'Laptop',
    'ARUN-LAPTOP',
    'Windows',
    '11',
    TRUE,
    TRUE,
    '2026-08-27 15:29:02.384278',
    '2026-08-27 15:29:02.384278'
),
(
    '2c258c27-dfc1-44ec-9a83-9c50c43dc66e',
    'EMP002',
    'Laptop',
    'RAVI-LAPTOP',
    'Linux',
    'Ubuntu 24.04',
    TRUE,
    TRUE,
    '2026-08-27 15:29:02.384278',
    '2026-08-27 15:29:02.384278'
),
(
    'a7129f3d-4d97-4069-b947-f531cceffc53',
    'EMP003',
    'Laptop',
    'PRIYA-LAPTOP',
    'Windows',
    '11',
    TRUE,
    TRUE,
    '2026-08-27 15:29:02.384278',
    '2026-08-27 15:29:02.384278'
),
(
    '22dff08f-a402-4f29-913c-7ab483cdc651',
    'EMP004',
    'Desktop',
    'KARTHIK-DESKTOP',
    'Windows',
    '10',
    TRUE,
    FALSE,
    '2026-08-27 15:29:02.384278',
    '2026-08-27 15:29:02.384278'
),
(
    '030df7cb-715c-423c-8868-519179eda8c1',
    'EMP005',
    'Laptop',
    'DIVYA-LAPTOP',
    'macOS',
    '15.5',
    FALSE,
    TRUE,
    '2026-08-27 15:29:02.384278',
    '2026-08-27 15:29:02.384278'
);

-- ============================================================
-- PROJECTS
-- ============================================================

INSERT INTO public.projects (
    project_id,
    project_name,
    description,
    status,
    project_manager_id,
    start_date,
    end_date,
    project_key
) VALUES
(
    '10200',
    'IT Operations',
    'General internal IT support, incidents, and service requests',
    'Active',
    'EMP003',
    '2026-01-05',
    NULL,
    'ITOPS'
),
(
    '10201',
    'Access Management',
    'Employee access, permissions, accounts, and provisioning',
    'Active',
    'EMP003',
    '2026-02-01',
    NULL,
    'ACCESS'
),
(
    '10202',
    'IT Automation',
    'Automated IT actions, workflows, and infrastructure tasks',
    'Active',
    'EMP003',
    '2026-09-01',
    NULL,
    'ITAUTO'
),
(
    'PROJ004',
    'Cloud Migration',
    'Enterprise cloud migration project',
    'Active',
    'EMP003',
    '2026-03-10',
    NULL,
    'CLOUD'
),
(
    'PROJ005',
    'Security Monitoring',
    'IT security monitoring project',
    'Planned',
    'EMP003',
    '2026-10-01',
    NULL,
    'SECMON'
);

-- ============================================================
-- PROJECT MEMBERS
-- ============================================================

INSERT INTO public.project_members (
    project_id,
    employee_id,
    project_role,
    status,
    start_date,
    end_date
) VALUES
(
    'PROJ001',
    'EMP001',
    'Developer',
    'Active',
    '2026-01-10',
    NULL
),
(
    'PROJ001',
    'EMP004',
    'Tester',
    'Active',
    '2026-01-15',
    NULL
),
(
    'PROJ001',
    'EMP003',
    'PM',
    'Active',
    '2026-01-05',
    NULL
),
(
    'PROJ002',
    'EMP002',
    'Developer',
    'Active',
    '2026-02-01',
    NULL
);

-- ============================================================
-- SYSTEM ACCESS
-- ============================================================

INSERT INTO public.system_access (
    access_id,
    employee_id,
    system_name,
    system_account_id,
    system_role,
    access_status,
    granted_at,
    expires_at,
    updated_at
) VALUES
(
    'b262846f-5f78-45b3-8624-ebf00e6a69eb',
    'EMP001',
    'GitHub',
    'arun_github',
    'Developer',
    'Active',
    '2026-08-27 15:27:07.979553',
    NULL,
    '2026-08-27 15:27:07.979553'
),
(
    'bdc8aa15-aa4f-4d2d-82f6-6498aaa174ba',
    'EMP001',
    'Jira',
    'arun_jira',
    'User',
    'Active',
    '2026-08-27 15:27:07.979553',
    NULL,
    '2026-08-27 15:27:07.979553'
),
(
    'eb9ad49c-ad27-4915-94f7-716dda7b6004',
    'EMP002',
    'VPN',
    'ravi_vpn',
    'User',
    'Active',
    '2026-08-27 15:27:07.979553',
    NULL,
    '2026-08-27 15:27:07.979553'
),
(
    '71592a43-6b37-4090-8887-4c7f0efdb227',
    'EMP003',
    'Confluence',
    'priya_confluence',
    'User',
    'Active',
    '2026-08-27 15:27:07.979553',
    NULL,
    '2026-08-27 15:27:07.979553'
),
(
    'e8901fd0-603b-429b-825e-2edcb54f1795',
    'EMP004',
    'GitHub',
    'karthik_github',
    'Tester',
    'Pending',
    '2026-08-27 15:27:07.979553',
    NULL,
    '2026-08-27 15:27:07.979553'
);

-- ============================================================
-- JIRA ACCOUNTS
-- ============================================================

INSERT INTO public.jira_accounts (
    jira_account_id,
    employee_id,
    jira_email,
    jira_display_name,
    jira_role,
    jira_access_level,
    jira_status,
    jira_project_roles,
    last_verified_at,
    created_at,
    updated_at
) VALUES
(
    'JIRA-EMP001',
    'EMP001',
    'arun@company.com',
    'Arun',
    'Developer',
    'User',
    'Active',
    '{"PROJ001": "Developer"}'::jsonb,
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919'
),
(
    'JIRA-EMP003',
    'EMP003',
    'priya@company.com',
    'Priya',
    'PM',
    'User',
    'Active',
    '{"PROJ001": "Project Admin", "PROJ002": "PM"}'::jsonb,
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919'
),
(
    'JIRA-EMP004',
    'EMP004',
    'karthik@company.com',
    'Karthik',
    'Tester',
    'User',
    'Active',
    '{"PROJ001": "Tester"}'::jsonb,
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919',
    '2026-08-27 15:30:53.425919'
);

-- ============================================================
-- DEMO LOGIN CREDENTIALS
-- Password: DemoPassword@123
-- ============================================================

INSERT INTO public.employee_credentials (
    employee_id,
    password_hash
) VALUES
(
    'EMP001',
    '$2b$12$oAagj8dbwbrLcCoq4/rwdOrqlkt/b816npF8IeB/JRPifQpZXxQ5i'
),
(
    'EMP005',
    '$2b$12$oAagj8dbwbrLcCoq4/rwdOrqlkt/b816npF8IeB/JRPifQpZXxQ5i'
);