-- Enterprise IT Support Platform
-- PostgreSQL database schema

CREATE TABLE public.employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100),
    job_title VARCHAR(100),
    role VARCHAR(50),
    availability_status VARCHAR(50),
    manager_id VARCHAR(50),
    employment_status VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.employee_credentials (
    employee_id VARCHAR(50) PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_credentials_employee
        FOREIGN KEY (employee_id)
        REFERENCES public.employees(employee_id)
        ON DELETE CASCADE
);

CREATE TABLE public.employee_configurations (
    configuration_id UUID PRIMARY KEY,
    employee_id VARCHAR,
    device_type VARCHAR,
    device_name VARCHAR,
    os VARCHAR,
    os_version VARCHAR,
    vpn_enabled BOOLEAN,
    mfa_enabled BOOLEAN,
    last_seen_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE public.projects (
    project_id VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    project_manager_id VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    project_key VARCHAR(20),

    CONSTRAINT fk_project_manager
        FOREIGN KEY (project_manager_id)
        REFERENCES public.employees(employee_id)
);

CREATE TABLE public.project_members (
    project_id VARCHAR,
    employee_id VARCHAR,
    project_role VARCHAR,
    status VARCHAR,
    start_date DATE,
    end_date DATE
);

CREATE TABLE public.system_access (
    access_id UUID PRIMARY KEY,
    employee_id VARCHAR,
    system_name VARCHAR,
    system_account_id VARCHAR,
    system_role VARCHAR,
    access_status VARCHAR,
    granted_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE public.jira_accounts (
    jira_account_id VARCHAR PRIMARY KEY,
    employee_id VARCHAR,
    jira_email VARCHAR,
    jira_display_name VARCHAR,
    jira_role VARCHAR,
    jira_access_level VARCHAR,
    jira_status VARCHAR,
    jira_project_roles JSONB,
    last_verified_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY,
    employee_id VARCHAR(50),
    query TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    response_json JSONB,
    raw_result_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.hitl_requests (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    reviewed_by VARCHAR(50),
    review_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    execution_status VARCHAR(30),
    execution_result JSONB,
    executed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_hitl_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES public.conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_hitl_employee
        FOREIGN KEY (employee_id)
        REFERENCES public.employees(employee_id)
        ON DELETE CASCADE
);