--
-- PostgreSQL database dump
--

\restrict m0ae794ubohOpuZBm23TUwckRRXbhG7H4R68F3sYysdD3Pv2P07iXcBgkD5qbca

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-01 12:22:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16430)
-- Name: employee_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_configurations (
    configuration_id uuid NOT NULL,
    employee_id character varying,
    device_type character varying,
    device_name character varying,
    os character varying,
    os_version character varying,
    vpn_enabled boolean,
    mfa_enabled boolean,
    last_seen_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.employee_configurations OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16387)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employee_id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    department character varying(100),
    job_title character varying(100),
    role character varying(50),
    availability_status character varying(50),
    manager_id character varying(50),
    employment_status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16438)
-- Name: jira_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jira_accounts (
    jira_account_id character varying NOT NULL,
    employee_id character varying,
    jira_email character varying,
    jira_display_name character varying,
    jira_role character varying,
    jira_access_level character varying,
    jira_status character varying,
    jira_project_roles jsonb,
    last_verified_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.jira_accounts OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16417)
-- Name: project_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_members (
    project_id character varying,
    employee_id character varying,
    project_role character varying,
    status character varying,
    start_date date,
    end_date date
);


ALTER TABLE public.project_members OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16401)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    project_id character varying(50) NOT NULL,
    project_name character varying(150) NOT NULL,
    description text,
    status character varying(50),
    project_manager_id character varying(50),
    start_date date,
    end_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16422)
-- Name: system_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_access (
    access_id uuid NOT NULL,
    employee_id character varying,
    system_name character varying,
    system_account_id character varying,
    system_role character varying,
    access_status character varying,
    granted_at timestamp without time zone,
    expires_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.system_access OWNER TO postgres;

--
-- TOC entry 5043 (class 0 OID 16430)
-- Dependencies: 223
-- Data for Name: employee_configurations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_configurations (configuration_id, employee_id, device_type, device_name, os, os_version, vpn_enabled, mfa_enabled, last_seen_at, updated_at) FROM stdin;
d69b9c70-556f-4cfb-99ce-f58718582b44	EMP001	Laptop	ARUN-LAPTOP	Windows	11	t	t	2026-08-27 15:29:02.384278	2026-08-27 15:29:02.384278
2c258c27-dfc1-44ec-9a83-9c50c43dc66e	EMP002	Laptop	RAVI-LAPTOP	Linux	Ubuntu 24.04	t	t	2026-08-27 15:29:02.384278	2026-08-27 15:29:02.384278
a7129f3d-4d97-4069-b947-f531cceffc53	EMP003	Laptop	PRIYA-LAPTOP	Windows	11	t	t	2026-08-27 15:29:02.384278	2026-08-27 15:29:02.384278
22dff08f-a402-4f29-913c-7ab483cdc651	EMP004	Desktop	KARTHIK-DESKTOP	Windows	10	t	f	2026-08-27 15:29:02.384278	2026-08-27 15:29:02.384278
030df7cb-715c-423c-8868-519179eda8c1	EMP005	Laptop	DIVYA-LAPTOP	macOS	15.5	f	t	2026-08-27 15:29:02.384278	2026-08-27 15:29:02.384278
\.


--
-- TOC entry 5039 (class 0 OID 16387)
-- Dependencies: 219
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employee_id, name, email, department, job_title, role, availability_status, manager_id, employment_status, created_at, updated_at) FROM stdin;
EMP001	Arun	arun@company.com	IT	Software Developer	Developer	active_project	\N	active	2026-08-27 15:21:33.303395	2026-08-27 15:21:33.303395
EMP002	Ravi	ravi@company.com	IT	Software Developer	Developer	bench	EMP001	active	2026-08-27 15:21:33.303395	2026-08-27 15:21:33.303395
EMP003	Priya	priya@company.com	Project Management	Project Manager	PM	active_project	\N	active	2026-08-27 15:21:33.303395	2026-08-27 15:21:33.303395
EMP004	Karthik	karthik@company.com	QA	QA Engineer	Tester	active_project	EMP003	active	2026-08-27 15:21:33.303395	2026-08-27 15:21:33.303395
EMP005	Divya	divya@company.com	IT Support	IT Support Engineer	IT Admin	inactive	\N	active	2026-08-27 15:21:33.303395	2026-08-27 15:21:33.303395
\.


--
-- TOC entry 5044 (class 0 OID 16438)
-- Dependencies: 224
-- Data for Name: jira_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jira_accounts (jira_account_id, employee_id, jira_email, jira_display_name, jira_role, jira_access_level, jira_status, jira_project_roles, last_verified_at, created_at, updated_at) FROM stdin;
JIRA-EMP001	EMP001	arun@company.com	Arun	Developer	User	Active	{"PROJ001": "Developer"}	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919
JIRA-EMP003	EMP003	priya@company.com	Priya	PM	User	Active	{"PROJ001": "Project Admin", "PROJ002": "PM"}	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919
JIRA-EMP004	EMP004	karthik@company.com	Karthik	Tester	User	Active	{"PROJ001": "Tester"}	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919	2026-08-27 15:30:53.425919
\.


--
-- TOC entry 5041 (class 0 OID 16417)
-- Dependencies: 221
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_members (project_id, employee_id, project_role, status, start_date, end_date) FROM stdin;
PROJ001	EMP001	Developer	Active	2026-01-10	\N
PROJ001	EMP004	Tester	Active	2026-01-15	\N
PROJ001	EMP003	PM	Active	2026-01-05	\N
PROJ002	EMP002	Developer	Active	2026-02-01	\N
\.


--
-- TOC entry 5040 (class 0 OID 16401)
-- Dependencies: 220
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (project_id, project_name, description, status, project_manager_id, start_date, end_date, created_at, updated_at) FROM stdin;
PROJ001	AI Helpdesk	AI powered IT helpdesk project	Active	EMP003	2026-01-05	\N	2026-08-27 15:34:39.182016	2026-08-27 15:34:39.182016
PROJ002	Employee Access Management	System access management project	Active	EMP003	2026-02-01	\N	2026-08-27 15:34:39.182016	2026-08-27 15:34:39.182016
PROJ003	IT Automation	Automation of IT support tasks	Planned	EMP003	2026-09-01	\N	2026-08-27 15:34:39.182016	2026-08-27 15:34:39.182016
PROJ004	Cloud Migration	Enterprise cloud migration project	Active	EMP003	2026-03-10	\N	2026-08-27 15:34:39.182016	2026-08-27 15:34:39.182016
PROJ005	Security Monitoring	IT security monitoring project	Planned	EMP003	2026-10-01	\N	2026-08-27 15:34:39.182016	2026-08-27 15:34:39.182016
\.


--
-- TOC entry 5042 (class 0 OID 16422)
-- Dependencies: 222
-- Data for Name: system_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_access (access_id, employee_id, system_name, system_account_id, system_role, access_status, granted_at, expires_at, updated_at) FROM stdin;
b262846f-5f78-45b3-8624-ebf00e6a69eb	EMP001	GitHub	arun_github	Developer	Active	2026-08-27 15:27:07.979553	\N	2026-08-27 15:27:07.979553
bdc8aa15-aa4f-4d2d-82f6-6498aaa174ba	EMP001	Jira	arun_jira	User	Active	2026-08-27 15:27:07.979553	\N	2026-08-27 15:27:07.979553
eb9ad49c-ad27-4915-94f7-716dda7b6004	EMP002	VPN	ravi_vpn	User	Active	2026-08-27 15:27:07.979553	\N	2026-08-27 15:27:07.979553
71592a43-6b37-4090-8887-4c7f0efdb227	EMP003	Confluence	priya_confluence	User	Active	2026-08-27 15:27:07.979553	\N	2026-08-27 15:27:07.979553
e8901fd0-603b-429b-825e-2edcb54f1795	EMP004	GitHub	karthik_github	Tester	Pending	2026-08-27 15:27:07.979553	\N	2026-08-27 15:27:07.979553
\.


--
-- TOC entry 4888 (class 2606 OID 16437)
-- Name: employee_configurations employee_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_configurations
    ADD CONSTRAINT employee_configurations_pkey PRIMARY KEY (configuration_id);


--
-- TOC entry 4880 (class 2606 OID 16400)
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- TOC entry 4882 (class 2606 OID 16398)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 4890 (class 2606 OID 16445)
-- Name: jira_accounts jira_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_accounts
    ADD CONSTRAINT jira_accounts_pkey PRIMARY KEY (jira_account_id);


--
-- TOC entry 4884 (class 2606 OID 16411)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- TOC entry 4886 (class 2606 OID 16429)
-- Name: system_access system_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_access
    ADD CONSTRAINT system_access_pkey PRIMARY KEY (access_id);


--
-- TOC entry 4891 (class 2606 OID 16412)
-- Name: projects fk_project_manager; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_project_manager FOREIGN KEY (project_manager_id) REFERENCES public.employees(employee_id);


-- Completed on 2026-09-01 12:22:57

--
-- PostgreSQL database dump complete
--

\unrestrict m0ae794ubohOpuZBm23TUwckRRXbhG7H4R68F3sYysdD3Pv2P07iXcBgkD5qbca

