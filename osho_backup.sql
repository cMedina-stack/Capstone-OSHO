--
-- PostgreSQL database dump
--

\restrict nK2RKeRdJVtAaZuRhpsTJfOqImD3cEimMuSt5YZfZgtWMeq7qtFd5W9h1nq1i45

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

--
-- Name: building_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.building_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: buildings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buildings (
    building_id character varying(12) DEFAULT ('BLDG-'::text || lpad((nextval('public.building_id_seq'::regclass))::text, 3, '0'::text)) NOT NULL,
    building_name character varying(150) NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    CONSTRAINT buildings_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT buildings_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))
);


--
-- Name: hazard_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hazard_assessments (
    assessment_id bigint NOT NULL,
    hazard_id bigint NOT NULL,
    assessment_date date DEFAULT CURRENT_DATE NOT NULL,
    assessed_by uuid,
    likelihood integer NOT NULL,
    severity integer NOT NULL,
    risk_score integer GENERATED ALWAYS AS ((likelihood * severity)) STORED,
    risk_level character varying(20) GENERATED ALWAYS AS (
CASE
    WHEN ((likelihood * severity) <= 4) THEN 'Low'::text
    WHEN ((likelihood * severity) <= 9) THEN 'Moderate'::text
    WHEN ((likelihood * severity) <= 16) THEN 'High'::text
    ELSE 'Critical'::text
END) STORED,
    control_action text NOT NULL,
    responsible_unit character varying(255),
    expected_output text,
    target_date date,
    assessment_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    accomplished_date date,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at timestamp without time zone,
    review_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by uuid,
    CONSTRAINT hazard_assessments_likelihood_check CHECK (((likelihood >= 1) AND (likelihood <= 5))),
    CONSTRAINT hazard_assessments_review_status_check CHECK (((review_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'needs_revision'::character varying])::text[]))),
    CONSTRAINT hazard_assessments_severity_check CHECK (((severity >= 1) AND (severity <= 5)))
);


--
-- Name: hazard_assessments_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hazard_assessments ALTER COLUMN assessment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hazard_assessments_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hazard_report_affected; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hazard_report_affected (
    affected_id bigint NOT NULL,
    hazard_id bigint NOT NULL,
    affected_type character varying(30) NOT NULL,
    CONSTRAINT hazard_report_affected_affected_type_check CHECK (((affected_type)::text = ANY ((ARRAY['students'::character varying, 'employees'::character varying, 'others'::character varying])::text[])))
);


--
-- Name: hazard_report_affected_affected_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hazard_report_affected ALTER COLUMN affected_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hazard_report_affected_affected_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hazard_report_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hazard_report_types (
    hazard_type_id bigint NOT NULL,
    hazard_id bigint NOT NULL,
    hazard_type character varying(50) NOT NULL
);


--
-- Name: hazard_report_types_hazard_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hazard_report_types ALTER COLUMN hazard_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hazard_report_types_hazard_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hazard_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hazard_reports (
    hazard_id bigint NOT NULL,
    report_title character varying(255) NOT NULL,
    report_date date NOT NULL,
    building_id character varying(20) NOT NULL,
    exact_area character varying(255) NOT NULL,
    description text NOT NULL,
    risk_associated text NOT NULL,
    preventive_action text NOT NULL,
    action_taken text,
    affected_others text,
    status character varying(30) DEFAULT 'submitted'::character varying NOT NULL,
    reported_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT hazard_reports_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'under_review'::character varying, 'resolved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: hazard_reports_hazard_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.hazard_reports ALTER COLUMN hazard_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hazard_reports_hazard_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: incident_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_assessments (
    assessment_id bigint NOT NULL,
    incident_id bigint NOT NULL,
    assessment_date date DEFAULT CURRENT_DATE NOT NULL,
    assessed_by uuid,
    incident_finding text NOT NULL,
    immediate_cause text,
    contributing_factors text,
    root_cause text,
    actual_consequence text,
    potential_consequence text,
    corrective_action text NOT NULL,
    preventive_action text,
    responsible_unit character varying(255),
    target_date date,
    assessment_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    accomplished_date date,
    osho_remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    initial_likelihood integer,
    initial_severity integer,
    initial_risk_score integer,
    initial_risk_level character varying(20),
    residual_likelihood integer,
    residual_severity integer,
    residual_risk_score integer,
    residual_risk_level character varying(20),
    review_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp without time zone,
    CONSTRAINT incident_assessments_assessment_status_check CHECK (((assessment_status)::text = ANY ((ARRAY['pending'::character varying, 'under_review'::character varying, 'action_required'::character varying, 'monitoring'::character varying, 'completed'::character varying, 'closed'::character varying, 'resolved'::character varying])::text[]))),
    CONSTRAINT incident_assessments_initial_likelihood_check CHECK (((initial_likelihood >= 1) AND (initial_likelihood <= 5))),
    CONSTRAINT incident_assessments_initial_severity_check CHECK (((initial_severity >= 1) AND (initial_severity <= 5))),
    CONSTRAINT incident_assessments_residual_likelihood_check CHECK (((residual_likelihood >= 1) AND (residual_likelihood <= 5))),
    CONSTRAINT incident_assessments_residual_severity_check CHECK (((residual_severity >= 1) AND (residual_severity <= 5))),
    CONSTRAINT incident_assessments_review_status_check CHECK (((review_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'needs_revision'::character varying])::text[])))
);


--
-- Name: incident_assessments_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.incident_assessments ALTER COLUMN assessment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.incident_assessments_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: incident_natures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_natures (
    incident_nature_id bigint NOT NULL,
    incident_id bigint NOT NULL,
    incident_nature character varying(50) NOT NULL
);


--
-- Name: incident_natures_incident_nature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.incident_natures ALTER COLUMN incident_nature_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.incident_natures_incident_nature_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: incident_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_reports (
    incident_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    age integer NOT NULL,
    sex character varying(20) NOT NULL,
    contact_number character varying(30),
    report_date date NOT NULL,
    building_id character varying(12) NOT NULL,
    description text NOT NULL,
    intervention_done text,
    status character varying(30) DEFAULT 'submitted'::character varying NOT NULL,
    reported_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    incident_type_others text,
    incident_nature_others text,
    exact_area character varying(255),
    injury_details text,
    action_taken text,
    witness_name character varying(255),
    witness_designation character varying(255),
    witness_contact_number character varying(30),
    CONSTRAINT incident_reports_age_check CHECK (((age >= 1) AND (age <= 120))),
    CONSTRAINT incident_reports_sex_check CHECK (((sex)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying])::text[]))),
    CONSTRAINT incident_reports_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'under_review'::character varying, 'resolved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: incident_reports_incident_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.incident_reports ALTER COLUMN incident_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.incident_reports_incident_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: incident_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_types (
    incident_type_id bigint NOT NULL,
    incident_id bigint NOT NULL,
    incident_type character varying(50) NOT NULL
);


--
-- Name: incident_types_incident_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.incident_types ALTER COLUMN incident_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.incident_types_incident_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: incident_workplace_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incident_workplace_roles (
    workplace_role_id bigint NOT NULL,
    incident_id bigint NOT NULL,
    workplace_role character varying(30) NOT NULL,
    CONSTRAINT incident_workplace_roles_workplace_role_check CHECK (((workplace_role)::text = ANY ((ARRAY['Staff'::character varying, 'Student'::character varying, 'Contractor'::character varying, 'Visitor'::character varying])::text[])))
);


--
-- Name: incident_workplace_roles_workplace_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.incident_workplace_roles ALTER COLUMN workplace_role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.incident_workplace_roles_workplace_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id bigint NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    notification_type character varying(50) NOT NULL,
    report_type character varying(20),
    report_id bigint,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN notification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    role character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Data for Name: buildings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.buildings (building_id, building_name, latitude, longitude) FROM stdin;
BLDG-001	Administration Building	14.997463	120.653977
BLDG-002	College of Arts and Sciences Building (CAS)	14.997971	120.654841
BLDG-003	College of Business Studies Building 1 (CBS)	14.997108	120.655863
BLDG-004	College of Business Studies Building 2 (CBS)	14.997430	120.656024
BLDG-005	CE/ME Laboratory Building	14.997344	120.655391
BLDG-006	CEA Building (Science & Technology)	14.997139	120.655082
BLDG-007	College Building (CB)	14.997733	120.653492
BLDG-008	College Building Extension 1 (CB Extn)	14.997769	120.653671
BLDG-009	Student Service Building	14.997779	120.654814
BLDG-010	Electrical Technology Building	14.998256	120.654251
BLDG-011	Engineering Building 1	14.997375	120.655621
BLDG-012	Engineering Building 2 (Guillermo Mendoza Hall)	14.997699	120.655530
BLDG-013	Engineering Laboratory Building	14.997111	120.655409
BLDG-014	Food Technology Building	14.997766	120.655235
BLDG-015	General Shoproom	14.998111	120.654870
BLDG-016	General Service & Security Office	14.998209	120.654068
BLDG-017	Graduate School Building	14.997909	120.654103
BLDG-018	Graduate School Building 2	14.997821	120.653883
BLDG-019	Executive Lounge	14.998375	120.656257
BLDG-020	Industrial Technology Building	14.998318	120.654650
BLDG-021	Industrial Technology Building Extension	14.998419	120.655160
BLDG-022	Integrated HRM Building (CHM)	14.998036	120.655163
BLDG-023	Integrated Science Building	14.997948	120.654243
BLDG-024	IRTPC	14.997595	120.656635
BLDG-025	IRTPC Extension	14.997396	120.656616
BLDG-026	Material Recovery Facility	14.997152	120.657732
BLDG-027	MDRTC	14.997733	120.656091
BLDG-028	MDRTC-Gazebo	14.997901	120.656109
BLDG-029	Medical/Dental	14.997075	120.655860
BLDG-030	Dr. Ernesto T. Nicdao Sports Center	14.998264	120.657579
BLDG-031	Multipurpose Hall	14.998595	120.656142
BLDG-032	NSTP & ROTC Office	14.998248	120.654326
BLDG-033	Physical Education Covered Court	14.997766	120.657236
BLDG-034	College of Computing Studies (CCS)	14.997671	120.654803
BLDG-035	IT Building	14.998476	120.655407
BLDG-036	Senior High School Building 1	14.997981	120.656984
BLDG-037	Tech Voc Building	14.998072	120.655434
BLDG-038	ICT Laboratory Building	14.997606	120.654581
BLDG-039	University Auditorium	14.998137	120.655804
BLDG-040	University Guest House	14.998627	120.656260
BLDG-041	University Hostel	14.998186	120.656171
BLDG-042	University Library	14.997699	120.654302
BLDG-043	Wellness Center	14.997619	120.657802
BLDG-044	Assessment Center	14.998632	120.656005
BLDG-045	Academic Building	14.998500	120.657016
BLDG-046	Data Center	14.997699	120.654302
BLDG-047	Senior High School Building 2	14.998038	120.656708
BLDG-048	Supply & Procurement Office	14.998186	120.653918
BLDG-049	CEA Extension	14.997310	120.654983
BLDG-050	CBS Building 3	14.997676	120.655817
BLDG-051	Diosdado P. Macapagal Museum & Period Park	14.997660	120.653223
BLDG-052	CSSP Building	14.997709	120.655077
BLDG-053	UFC	14.997238	120.654524
BLDG-054	Academic Building 2	14.997108	120.653701
BLDG-055	Health & Science Building	14.997406	120.657035
BLDG-056	IT and Computer Engineering Building	14.998593	120.655793
BLDG-057	Academic Building 1 Extension	14.998541	120.656737
BLDG-058	IRTPC 1 Extension Building	14.997567	120.656930
BLDG-059	Community Sports Facilities	14.997707	120.656879
\.


--
-- Data for Name: hazard_assessments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hazard_assessments (assessment_id, hazard_id, assessment_date, assessed_by, likelihood, severity, control_action, responsible_unit, expected_output, target_date, assessment_status, accomplished_date, remarks, created_at, updated_at, reviewed_at, review_status, reviewed_by) FROM stdin;
2	3	2026-09-30	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2	5	adfadf	adfa	adfa	2026-10-05	completed	2026-09-30	adfadfasf	2026-09-30 18:20:53.736011	2026-09-30 19:17:44.455665	\N	pending	\N
4	10	2026-09-30	d56eb62e-53a9-4865-b80c-542cc875faea	3	5	Install an appropriate emergency escape facility.	\N	\N	\N	pending	\N	\N	2026-09-30 19:47:32.057679	2026-09-30 19:47:32.057679	\N	pending	\N
5	11	2026-09-30	628d48ef-b2ef-46d0-aae5-8385fe0574ec	4	3	Keep walkways clear and dry; install warning signs during cleaning; repair damaged flooring and improve housekeeping inspections.	General Services / Facility Management	Clear, dry and safe walkways with hazards promptly corrected.	2026-10-15	completed	2026-09-29	Daily housekeeping checks recommended.	2026-09-30 22:08:18.239261	2026-09-30 22:10:46.118536	\N	pending	\N
3	5	2025-02-09	628d48ef-b2ef-46d0-aae5-8385fe0574ec	4	5	Provide an appropriate fire extinguisher and maintain regular inspection.	GIMU	Ready-to-use fire extinguisher anytime needed	2026-10-02	completed	2026-09-30	Accomplished	2026-09-30 18:46:30.703531	2026-09-30 22:25:38.380328	\N	pending	\N
6	47	2026-09-29	628d48ef-b2ef-46d0-aae5-8385fe0574ec	4	3	fightt	\N	\N	2026-09-29	completed	2026-09-30	Helloo	2026-09-30 22:39:36.4254	2026-09-30 22:41:48.014833	\N	pending	\N
7	46	2026-09-29	628d48ef-b2ef-46d0-aae5-8385fe0574ec	3	4	Hi	\N	\N	2026-09-09	completed	2026-09-29	\N	2026-09-30 22:42:54.806261	2026-09-30 22:43:18.27891	\N	pending	\N
8	9	2026-09-30	628d48ef-b2ef-46d0-aae5-8385fe0574ec	3	3	Already done	GSO	Hazard Removed	2026-10-06	completed	2026-09-30	All done	2026-09-30 22:45:51.443094	2026-09-30 22:46:37.045668	\N	pending	\N
9	28	2026-09-30	628d48ef-b2ef-46d0-aae5-8385fe0574ec	3	3	asd	GSO	Hazard Removed	2026-10-07	completed	2026-09-30	None	2026-09-30 22:47:25.833216	2026-09-30 22:47:44.060052	\N	pending	\N
25	32	2026-10-01	d56eb62e-53a9-4865-b80c-542cc875faea	3	1	Organized and perfect placement of things	\N	\N	\N	under_review	\N	\N	2026-10-01 00:27:26.268791	2026-10-01 00:27:26.268791	\N	pending	\N
14	27	2026-09-29	628d48ef-b2ef-46d0-aae5-8385fe0574ec	5	4	as	s	s	2026-09-30	under_review	2026-09-30	goodjob	2026-09-30 23:02:59.435972	2026-09-30 23:06:41.986014	\N	pending	\N
24	36	2026-10-01	d56eb62e-53a9-4865-b80c-542cc875faea	3	2	Slips, property damage, and possible electrical hazards	\N	\N	\N	under_review	\N	why is that	2026-10-01 00:22:54.288767	2026-10-01 00:33:01.441552	2026-10-01 00:33:01.442	needs_revision	9c2a1d6a-ed09-4d7e-9f84-cfbe96309d7a
15	20	2026-09-28	628d48ef-b2ef-46d0-aae5-8385fe0574ec	3	4	asd	zxc	ghi	2026-10-07	action_required	2026-09-28	GoodJob	2026-09-30 23:05:04.051819	2026-10-01 00:11:53.080499	2026-10-01 00:11:53.098	approved	9c2a1d6a-ed09-4d7e-9f84-cfbe96309d7a
\.


--
-- Data for Name: hazard_report_affected; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hazard_report_affected (affected_id, hazard_id, affected_type) FROM stdin;
1	1	others
2	2	employees
3	3	employees
4	4	employees
5	5	others
6	6	students
7	7	employees
8	8	employees
9	9	employees
10	10	students
11	11	students
12	11	employees
13	12	employees
15	2	others
16	3	others
19	5	students
20	5	employees
21	6	employees
24	8	students
25	8	employees
26	8	others
27	9	employees
28	10	students
29	10	employees
30	11	employees
31	12	students
32	12	employees
33	12	others
34	13	students
35	13	employees
36	14	students
37	14	employees
38	15	students
39	15	employees
40	16	students
41	16	employees
42	17	employees
43	18	students
44	18	employees
45	18	others
46	19	employees
47	20	students
48	20	employees
49	21	employees
50	22	employees
51	23	students
52	23	employees
53	24	students
54	24	employees
55	25	students
56	25	employees
57	26	students
58	26	employees
59	27	students
60	27	employees
61	28	students
62	28	employees
63	29	students
64	29	employees
65	29	others
66	30	students
67	30	employees
68	31	students
69	31	employees
70	32	employees
71	33	employees
72	34	students
73	34	employees
74	35	students
75	35	employees
76	36	students
77	36	employees
78	37	students
79	37	employees
80	38	employees
81	39	students
82	39	employees
83	40	employees
84	41	employees
85	41	others
86	42	students
87	42	employees
88	42	others
89	43	students
90	43	employees
91	44	employees
92	45	students
93	45	employees
94	46	others
95	47	students
96	47	employees
97	47	others
\.


--
-- Data for Name: hazard_report_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hazard_report_types (hazard_type_id, hazard_id, hazard_type) FROM stdin;
1	1	Ergonomical
2	1	Chemical
3	2	Chemical
4	3	Chemical
5	4	Chemical
6	5	Physical
7	5	Ergonomical
8	6	Biology
9	7	Ergonomical
10	8	Physical
11	8	Ergonomical
12	9	Biology
13	10	Biology
14	10	Physical
15	11	Physical
16	12	Physical
19	2	Safety
20	2	Biological
21	3	Safety
22	3	Physical
24	5	Safety
25	6	Safety
27	8	Safety
28	9	Physical
29	10	Safety
30	11	Safety
31	12	Safety
32	13	Safety
33	14	Physical
34	15	Safety
35	16	Biological
36	17	Safety
37	18	Safety
38	19	Ergonomical
39	20	Biological
40	21	Biological
41	22	Safety
42	23	Safety
43	24	Safety
44	25	Physical
45	26	Chemical
46	27	Physical
47	28	Safety
48	29	Safety
49	30	Biological
50	31	Physical
51	32	Safety
52	33	Safety
53	34	Safety
54	35	Safety
55	36	Safety
56	37	Safety
57	38	Chemical
58	39	Safety
59	40	Safety
60	41	Biological
61	42	Safety
62	43	Safety
63	44	Ergonomical
64	45	Safety
65	46	Safety
66	47	Biological
\.


--
-- Data for Name: hazard_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hazard_reports (hazard_id, report_title, report_date, building_id, exact_area, description, risk_associated, preventive_action, action_taken, affected_others, status, reported_by, created_at, updated_at) FROM stdin;
15	Lack of Fire Exit Ladder	2026-07-07	BLDG-011	Upper floor emergency area	An appropriate emergency exit ladder is not available in the identified area.	Entrapment and delayed evacuation	Install an appropriate emergency escape facility.	Hazard was documented and referred to the concerned office.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 20:43:35.292486	2026-09-30 20:43:35.292486
16	Improper Waste Disposal	2026-07-16	BLDG-049	Laboratory rear area	Mixed waste was observed in an area intended for laboratory disposal.	Foul odor, contamination, pests, and disease exposure	Implement proper segregation and regular waste collection.	Waste was segregated and the area was cleaned.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:45:23.346555	2026-09-30 20:45:23.346555
17	Unsecured Cabinet	2026-07-21	BLDG-009	Office filing area	A tall filing cabinet is not properly secured and contains several heavy files.	Falling objects and head injury	Secure cabinets and avoid overloading upper shelves.	Cabinet contents were reduced and the condition was reported for securing.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:47:58.140861	2026-09-30 20:47:58.140861
18	Improper Furniture Storage	2026-07-14	BLDG-031	Side storage area	Foldable chairs and unused furniture are stored close to the walking path.	Tripping and obstruction during evacuation	Store furniture in a designated area away from walkways.	Furniture was rearranged and the pathway was cleared.	Visitors	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:49:17.994654	2026-09-30 20:49:17.994654
19	Poor Ergonomic Seating	2026-07-16	BLDG-004	Faculty office	Office chairs provide inadequate back support for prolonged computer work.	Back pain and musculoskeletal discomfort	Provide suitable ergonomic chairs and encourage proper sitting posture.	Existing chairs were inspected and replacement was recommended.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:50:51.243664	2026-09-30 20:50:51.243664
21	Termite Infestation	2026-07-21	BLDG-002	Faculty office storage cabinet	Signs of termite activity were observed on wooden furniture and storage materials.	Property damage and possible structural deterioration	Inspect affected areas and conduct appropriate pest control.	Infested furniture was reported for inspection and treatment.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:52:39.094637	2026-09-30 20:52:39.094637
9	Inadequate Office Lighting	2026-09-15	BLDG-001	Records Office	Several light fixtures provide insufficient illumination in the work area.	Eye strain, headaches, and reduced visibility	Repair defective lights and install additional lighting where needed	Defective lighting was reported for replacement.	\N	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 19:37:29.14017	2026-09-30 22:46:37.045668
6	Cluttered Electrical Wiring	2025-10-14	BLDG-034	Faculty Office	Extension cords and electrical wires are arranged across part of the office floor.	Tripping and electric shock	Properly route electrical wires and relocate extension connections.	Loose wires were rearranged away from the main walking path.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 19:02:10.90177	2026-09-30 19:02:10.90177
8	Inaccessible Emergency Exit	2026-01-16	BLDG-039	Rear emergency exit	Stored materials partially obstruct the emergency exit.	Delayed evacuation during emergencies	Keep emergency exits clear and prohibit storage in exit routes.	Obstructing materials were removed from the exit area.	Visitors	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 19:16:43.624373	2026-09-30 19:16:43.624373
3	sdfds	2026-09-21	BLDG-003	sdfaas	asdf	adf	afdaf	a	asdfa	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 18:20:34.20331	2026-09-30 19:17:44.455665
10	Lack of Fire Exit Ladder	2026-03-04	BLDG-011	Upper floor emergency area	An appropriate emergency exit ladder is not available in the identified area.	Entrapment and delayed evacuation	Install an appropriate emergency escape facility.	Hazard was documented and referred to the concerned office.	\N	under_review	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 19:39:32.023438	2026-09-30 19:47:32.057679
12	Uneven Walkway	2026-07-04	BLDG-033	Entrance pathway	Part of the concrete pathway has an uneven surface.	Trip and fall	Repair uneven surfaces and place warning signs while awaiting repair.	Hazardous section was identified and reported for repair.	Visitors	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:28:05.37482	2026-09-30 20:28:05.37482
13	Damaged Ceiling	2026-07-06	BLDG-018	3rd Floor corridor	A portion of the ceiling shows signs of deterioration and may loosen.	Falling debris and head injury	Repair damaged ceiling and restrict access if deterioration worsens.	Area was reported to the maintenance office for inspection.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:31:08.3853	2026-09-30 20:31:08.3853
14	Poor Airflow	2026-07-07	BLDG-055	Laboratory room	Airflow inside the laboratory is insufficient during occupied periods.	Heat discomfort and respiratory discomfort	Improve ventilation and maintain fans or exhaust systems.	Ventilation problem was documented and reported for corrective action.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:32:11.178951	2026-09-30 20:32:11.178951
22	Overloaded Cabinet	2026-06-12	BLDG-004	Faculty office	Heavy files are stored above the recommended level of a cabinet.	Falling objects and head injury	Reduce cabinet load and store heavy materials at lower levels.	Heavy materials were transferred to lower storage.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 20:53:11.101795	2026-09-30 20:53:11.101795
23	Blocked Emergency Exit	2026-07-23	BLDG-014	Food laboratory exit	Equipment and movable materials are positioned near the emergency exit.	Delayed evacuation and possible injury	Maintain unobstructed emergency exits at all times.	Materials were moved away from the exit.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:54:05.744998	2026-09-30 20:54:05.744998
24	Faulty Electrical Outlet	2026-07-28	BLDG-056	Computer laboratory	An electrical outlet has a damaged cover and shows signs of wear.	Electric shock, short circuit, and fire	Replace damaged outlet and prohibit use until inspected.	Outlet was reported and temporarily avoided.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:54:39.563182	2026-09-30 20:54:39.563182
25	Poor Ventilation in Workshop	2026-07-16	BLDG-020	Machine workshop	Workshop ventilation is insufficient while machines are operating.	Heat stress and exposure to airborne particles	Improve industrial ventilation and maintain exhaust systems.	Ventilation concern was reported for corrective action.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:55:12.503859	2026-09-30 20:55:12.503859
26	Improper Chemical Storage	2026-08-06	BLDG-023	Chemistry preparation area	Chemical containers are stored without sufficient separation and organization.	Chemical spill, exposure, and fire	Properly label, segregate, and store chemicals in suitable cabinets.	Containers were reorganized and the storage condition was reported.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:56:08.679912	2026-09-30 20:56:08.679912
11	Lack of Proper Storage	2026-09-29	BLDG-003	Faculty storage area	Files and unused materials are stacked in a limited storage space.	Tripping, falling objects, and damaged materials	Apply 7S organization and provide appropriate storage facilities.	Unnecessary materials were sorted and reorganized.	\N	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 19:40:08.303979	2026-09-30 22:10:46.118536
20	Water Accumulation	2026-08-25	BLDG-022	Rear service area	Standing water was observed near the rear portion of the building.	Mosquito breeding and mosquito-borne diseases	Remove standing water and improve drainage.	Standing water was removed and the area was cleaned.	\N	under_review	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:51:52.983021	2026-10-01 00:11:53.080499
29	Slippery Floor	2026-03-03	BLDG-053	Dining area entrance	The floor becomes slippery when water or spilled liquid is not immediately removed.	Slip and fall	Clean spills immediately and provide warning signs when floors are wet.	Wet portion was cleaned and a warning sign was placed.	Visitors	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:12:21.035575	2026-09-30 21:12:21.035575
30	Inadequate Toilet Facilities	2026-08-18	BLDG-017	Ground Floor comfort room	Toilet facilities require maintenance and regular cleaning due to poor condition.	Germ transmission, foul odor, and sanitation concerns	Conduct regular cleaning and repair defective fixtures.	Cleaning was requested and defective fixtures were reported.	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 21:13:23.992555	2026-09-30 21:13:23.992555
31	Poor Lighting on Stairway	2026-07-09	BLDG-008	Main stairway	Stairway lighting is insufficient during low-light periods.	Missteps, trips, and falls	Install or repair lighting fixtures along the stairway.	Lighting deficiency was reported for repair.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:15:46.307706	2026-09-30 21:15:46.307706
33	Improper Storage of Combustible Materials	2026-08-20	BLDG-048	Stockroom	Cardboard boxes and other combustible materials are stored close together in the stockroom.	Increased fire risk and difficult evacuation	Organize materials and keep combustible items away from ignition sources.	\N	\N	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 21:20:20.525894	2026-09-30 21:20:20.525894
34	Damaged Faucet Connection	2026-06-13	BLDG-014	Tourism laboratory	Faucet connection shows signs of leakage during use.	Water accumulation and slip hazard	Repair or replace defective plumbing fixtures.	Water source was turned off temporarily and repair was requested.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:21:21.979208	2026-09-30 21:21:21.979208
35	Lack of Storage Space	2026-06-20	BLDG-034	Student laboratory	Equipment boxes and unused materials occupy portions of the laboratory floor.	Tripping and obstruction	Provide suitable storage and maintain organized work areas.	Unused boxes were consolidated and the pathway was cleared.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:36:09.850241	2026-09-30 21:36:09.850241
37	Inadequate Machine Guarding	2026-06-17	BLDG-015	Machine workshop	A machine has insufficient guarding around a moving component.	Caught-between injury and serious physical injury	Install appropriate machine guarding and prohibit unsafe operation.	Machine was not used until the guarding concern was reported.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:44:07.933872	2026-09-30 21:44:07.933872
38	Improper Hazardous Waste Storage	2026-10-06	BLDG-038	Equipment storage area	Old electronic materials and potentially hazardous waste are stored together without proper segregation.	Chemical exposure, spills, and fire	Establish proper hazardous waste segregation and disposal.	Materials were separated and disposal was requested.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:48:31.029983	2026-09-30 21:48:31.029983
39	Broken/Sagging Ceiling	2026-07-19	BLDG-007	2nd Floor classroom	A ceiling section appears loose and sagging above the occupied classroom.	Falling debris and head injury	Inspect and repair the damaged ceiling immediately.	Classroom area was reported for inspection and repair.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:54:06.809769	2026-09-30 21:54:06.809769
40	Inadequate Air Conditioning	2026-07-04	BLDG-003	Faculty room	Air conditioning is insufficient for the number of occupants in the room.	Heat discomfort and reduced concentration	Repair the unit and improve room ventilation.	Concern was reported for air-conditioning inspection.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:56:34.065742	2026-09-30 21:56:34.065742
41	Termite-Damaged Furniture	2026-08-04	BLDG-041	Common room storage area	Wooden furniture shows signs of termite damage.	Property damage and possible falling furniture	Inspect affected furniture and conduct pest control.	Damaged furniture was isolated and reported for inspection.	Residents	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 22:07:49.368105	2026-09-30 22:07:49.368105
42	Insufficient Emergency Signage	2026-08-05	BLDG-031	Emergency exit corridor	Emergency directional signs are not clearly visible from the corridor.	Delayed evacuation during emergencies	Install visible directional and emergency exit signage.	Signage deficiency was documented and reported.	Visitors	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 22:12:00.378755	2026-09-30 22:12:00.378755
43	Poor Lighting in Stairwell	2026-06-09	BLDG-045	1st–2nd Floor stairwell	One or more light fixtures provide insufficient illumination on the stairs.	Missteps and falls	Repair defective lights and maintain adequate illumination.	Defective lighting was reported for replacement.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 22:13:18.897164	2026-09-30 22:13:18.897164
44	Poor Ergonomic Workstation	2026-07-19	BLDG-045	Administrative office	Computer workstation arrangement requires prolonged awkward sitting and reaching.	Musculoskeletal discomfort and poor posture	Adjust workstation height and provide ergonomic seating.	Workstation was rearranged and ergonomic adjustment was recommended.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 22:15:56.567645	2026-09-30 22:15:56.567645
45	Improper Material Storage	2026-06-10	BLDG-037	Workshop storage corner	Materials and equipment are stacked without sufficient organization near the work area.	Falling objects, trips, and property damage	Sort materials, apply 7S, and provide appropriate storage.	Materials were reorganized and the walking path was cleared.	\N	submitted	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 22:17:01.438472	2026-09-30 22:17:01.438472
46	Uneven Pathway	2026-09-30	BLDG-033	Entrance pathway	Part of the concrete pathway has an uneven surface.	Trip and fall	Repair uneven surfaces and place warning signs while awaiting repair.	Hazardous section was identified and reported for repair.	Visitors	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 22:21:58.381476	2026-09-30 22:43:18.27891
28	Cracked Glass Window	2026-08-26	BLDG-042	2nd Floor reading area	A window pane has a visible crack near the reading area.	Glass breakage and laceration	Replace damaged glass and restrict access if necessary.	Area near the window was temporarily avoided and the damage was reported.	\N	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:58:35.148851	2026-09-30 22:47:44.060052
27	Accumulated Dust	2026-08-21	BLDG-036	Classroom ceiling fan	Dust has accumulated heavily on a ceiling fan and nearby ventilation areas.	Respiratory irritation and poor air quality	Clean ventilation equipment regularly and maintain proper airflow.	Dust accumulation was reported and cleaning was requested.	\N	under_review	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 20:56:45.414951	2026-09-30 23:06:41.986014
32	Overloaded Cabinet	2026-08-15	BLDG-004	Faculty office	Heavy files are stored above the recommended level of a cabinet.	Falling objects and head injury	Reduce cabinet load and store heavy materials at lower levels.	Heavy materials were transferred to lower storage.	\N	under_review	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:17:32.390976	2026-10-01 00:27:26.268791
36	Damaged Floor Surface	2026-08-23	BLDG-013	Laboratory entrance	A section of the floor has holes and an uneven surface.	Trip, fall, and possible cuts	Repair damaged flooring and mark the affected area.	Damaged section was reported and temporarily marked.	\N	under_review	d56eb62e-53a9-4865-b80c-542cc875faea	2026-09-30 21:39:37.220429	2026-10-01 00:33:01.441552
5	Lack of Fire Extinguisher	2025-02-12	BLDG-038	Computer Laboratory	No readily accessible fire extinguisher was observed inside the laboratory.	Delayed fire response and fire-related injuries.	Provide an appropriate fire extinguisher and maintain regular inspection.	Request for fire extinguisher installation was endorsed to the concerned office.	\N	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 18:37:17.343363	2026-09-30 22:25:38.380328
47	Accumulated Water Near Building	2026-09-30	BLDG-009	Rear drainage area	Water accumulates near the rear drainage area after rainfall.	Mosquito breeding and mosquito-borne disease	Improve drainage and regularly remove stagnant water.	Standing water was removed and the area was cleaned.	Visitors	resolved	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 22:23:20.546911	2026-09-30 22:41:48.014833
\.


--
-- Data for Name: incident_assessments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incident_assessments (assessment_id, incident_id, assessment_date, assessed_by, incident_finding, immediate_cause, contributing_factors, root_cause, actual_consequence, potential_consequence, corrective_action, preventive_action, responsible_unit, target_date, assessment_status, accomplished_date, osho_remarks, created_at, updated_at, initial_likelihood, initial_severity, initial_risk_score, initial_risk_level, residual_likelihood, residual_severity, residual_risk_score, residual_risk_level, review_status, reviewed_by, reviewed_at) FROM stdin;
9	13	2026-08-14	a531a376-9f40-47df-9931-8f36edef58b8	N/A	\N	\N	\N	\N	\N	N/A	\N	\N	2026-10-05	under_review	2026-10-01	\N	2026-10-01 00:31:48.412039	2026-10-01 00:31:48.412039	5	5	25	Critical	1	1	1	Low	pending	\N	\N
8	31	2026-09-30	a531a376-9f40-47df-9931-8f36edef58b8	N/A	\N	\N	\N	\N	\N	N/A	\N	\N	2026-10-06	action_required	2026-10-01	\N	2026-10-01 00:27:29.617497	2026-10-01 00:37:38.077492	1	1	1	Low	4	3	12	High	approved	9c2a1d6a-ed09-4d7e-9f84-cfbe96309d7a	2026-10-01 00:37:38.079
\.


--
-- Data for Name: incident_natures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incident_natures (incident_nature_id, incident_id, incident_nature) FROM stdin;
1	3	falls-slips-tripping
2	4	falls-slips-tripping
3	5	others
4	6	others
5	7	others
6	8	others
7	9	others
8	10	others
9	11	others
10	12	others
11	13	falls-slips-tripping
12	14	others
13	15	chemical-exposure
14	16	medical-emergency
15	17	others
16	18	others
17	19	property-damage
18	20	falls-slips-tripping
19	21	others
20	22	others
21	23	chemical-exposure
22	24	falls-slips-tripping
23	25	others
24	26	others
25	27	others
26	28	falls-slips-tripping
27	29	others
28	30	others
29	31	physical-injury
30	32	others
31	33	falls-slips-tripping
32	34	others
44	46	physical-injury
\.


--
-- Data for Name: incident_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incident_reports (incident_id, name, age, sex, contact_number, report_date, building_id, description, intervention_done, status, reported_by, created_at, updated_at, incident_type_others, incident_nature_others, exact_area, injury_details, action_taken, witness_name, witness_designation, witness_contact_number) FROM stdin;
1	qwewqe	23	female	1233	2026-09-10	BLDG-002	2321	3	submitted	5e23c04f-888c-4851-a176-ff04b85c45f9	2026-09-30 06:40:52.869219	2026-09-30 06:40:52.869219	\N	\N	\N	\N	\N	\N	\N	\N
2	sdfdsfdsf	23	male	213123213	2026-09-10	BLDG-019	sdfd	sdf	submitted	628d48ef-b2ef-46d0-aae5-8385fe0574ec	2026-09-30 16:04:58.668561	2026-09-30 16:04:58.668561	dsfds	sdf	sdfdsds	\N	\N	\N	\N	\N
3	Mark Anthony Santos	20	male	0917-000-1001	2026-09-01	BLDG-007	The student nearly slipped after stepping on a wet portion of the floor.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 18:58:24.674489	2026-09-30 18:58:24.674489	\N	\N	Ground Floor Corridor	\N	Area was immediately dried and a warning sign was placed.	John Reyes	Classmate	0917-000-2001
4	Maria Lopez	34	female	0918-000-1002	2026-09-02	BLDG-001	The staff member slipped on a wet stair and fell onto the lower step.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 19:09:42.268942	2026-09-30 19:09:42.268942	\N	\N	Stairway, 2nd Floor	Minor bruising on the right knee.	First aid was provided and the stairway was cleaned and inspected.	Carla Mendoza	Administrative Staff	0918-000-2002
5	Kevin Cruz	19	male	0919-000-1003	2026-09-03	BLDG-008	A loose electrical wire was observed near a computer workstation.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 19:12:44.364622	2026-09-30 19:12:44.364622	Hazard	Electrical Hazard	Room 204	\N	Power supply was disconnected and the wire was referred to maintenance.	Angelo Garcia	Classmate	0919-000-2003
6	Angela Flores	21	female	0920-000-1004	2026-09-04	BLDG-017	A classroom chair broke while being used by a student.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 19:15:05.379455	2026-09-30 19:15:05.379455	\N	Equipment/ Facility Damage	Room 105	\N	Broken chair was removed and reported to the property custodian.	Patricia Ramos	Classmate	0920-000-2004
7	Daniel Aquino	18	male	0921-000-1005	2026-09-05	BLDG-007	The student accidentally cut his finger while handling laboratory equipment.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 19:17:04.73332	2026-09-30 19:17:04.73332	\N	Cut/Laceration	Laboratory Room 301	Small cut on the left index finger.	Wound was cleaned and covered with a sterile bandage.	Mark Villanueva	Classmate	0921-000-2005
8	Roberto Garcia	42	male	0922-000-1006	2026-09-06	BLDG-001	Smoke was noticed coming from an electrical outlet.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 19:18:54.722194	2026-09-30 19:18:54.722194	\N	Electrical Fault	Records Office	\N	Power was shut off and the maintenance team inspected the outlet.	Liza Torres	Office Staff	0922-000-2006
9	Joshua Reyes	20	male	0923-000-1007	2026-08-03	BLDG-007	A small object fell from a shelf and struck the student's shoulder.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:04:05.04513	2026-09-30 20:04:05.04513	\N	Falling Object	Third Floor Hallway	A small object fell from a shelf and struck the student's shoulder.	First aid was provided and the shelf was inspected.	Carlo Santos	Classmate	0923-000-2007
10	Elisa Navarro	38	female	0924-000-1008	2026-07-06	BLDG-048	Water was leaking from a damaged pipe near the storage area.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:10:32.5368	2026-09-30 20:10:32.5368	Hazard	Water Leakage	Storage Room	\N	Water supply was temporarily shut off and maintenance was notified.	Ramon Diaz	Maintenance Personnel	0924-000-2008
11	Ronald Bautista	29	male	0925-000-1009	2026-08-12	BLDG-030	A motorcycle accidentally collided with a parked vehicle while entering the parking area.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:16:26.634714	2026-09-30 20:16:26.634714	\N	Minor Collision	Main Parking Area	\N	Security personnel documented the incident and inspected the vehicles.	Eric Ramos	Security Guard	0925-000-2009
12	Francis Dela Cruz	19	male	0926-000-1010	2026-08-17	BLDG-033	The student experienced dizziness after participating in an outdoor activity under hot weather.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:18:26.989344	2026-09-30 20:18:26.989344	\N	Heat Exhaustion	Outdoor Activity Area	No physical injury; dizziness and weakness were reported.	Student was moved to a shaded area, given water, and monitored.	Miguel Santos	Classmate	0926-000-2010
14	Patrick Reyes	22	male	0928-000-1012	2026-07-04	BLDG-018	A classroom window was found cracked and partially broken.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:49:47.53432	2026-09-30 20:49:47.53432	\N	Broken Glass	2nd floor, Room 202	No injury.	Area was restricted and the broken glass was safely removed.	Leo Garcia	Student	0928-000-2012
15	Nicole Garcia	20	female	0929-000-1013	2026-07-06	BLDG-047	A small amount of laboratory chemical was accidentally spilled on the table.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:57:25.720834	2026-09-30 20:57:25.720834	\N	\N	Laboratory 3 table	No injury.	Laboratory personnel isolated the area and cleaned the spill using proper procedures.	Mark Aquino	Laboratory Partner	0929-000-2013
16	Teresa Ramos	45	female	0930-000-1014	2026-07-07	BLDG-001	The staff member reported experiencing a severe headache while working.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:01:33.738594	2026-09-30 21:01:33.738594	\N	\N	Finance Building	No injury.	Staff member was allowed to rest and was advised to seek medical attention if symptoms continued.	Maria Santos	Co-Worker	0930-000-2014
17	Adrian Cruz	19	male	0931-000-1015	2026-07-08	BLDG-008	A ceiling panel was observed partially detached.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:04:17.763398	2026-09-30 21:04:17.763398	\N	Falling Object	Second Floor Corridor	No injury.	Area was temporarily restricted and maintenance was requested to repair the ceiling.	Brian Lopez	Classmate	0931-000-2015
18	Samantha Torres	20	female	0932-000-1016	2026-07-09	BLDG-055	The student accidentally touched a heated laboratory container.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:12:40.51834	2026-09-30 21:12:40.51834	\N	Minor Burn	Chemistry Laboratory	Minor burn on the right hand.	The affected area was cooled with clean running water and first aid was provided.	Rachel Cruz	Classmate	0932-000-2016
19	Roberto Diaz	42	male	0916-786-2345	2026-07-10	BLDG-016	Two service vehicles made minor contact while reversing.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:27:06.066396	2026-09-30 21:27:06.066396	\N	\N	Vehicle parking area	None.	Vehicles were inspected and the incident was documented.	Leo Martinez	Security Guard	0920-345-67899
20	Josephine Cruz	29	female	0918-765-4321	2026-07-11	BLDG-017	The student lost balance while going down the stairs.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:32:55.348845	2026-09-30 21:32:55.348845	\N	\N	Stairway	Minor bruising on the right arm.	First aid was provided and the stairway was checked for safety hazards.	Mark Reyes	Graduate Student	0921-234-5678
21	Laura Mendoza	35	female	0923-456-7890	2026-07-13	BLDG-018	Water leaked through the ceiling and reached several areas of the room.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:37:19.396535	2026-09-30 21:37:19.396535	\N	Ceiling leak	2nd floor, Room 201	None.	Electronic equipment was moved away from the affected area and maintenance was notified.	Carlo Ramos	Maintenance Staff	0917-345-6782
22	Helen Ramos	38	female	0919-345-7890	2026-07-14	BLDG-019	An electric appliance became unusually hot during use.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:42:07.692663	2026-09-30 21:42:07.692663	\N	\N	Pantry	None.	The appliance was unplugged and removed for inspection.	Anna York	Staff	0922-456-7890
23	Noel Garcia	22	male	0924-567-8901	2026-07-15	BLDG-020	A small amount of cleaning chemical accidentally contacted the student's hand.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:51:05.766634	2026-09-30 21:51:05.766634	\N	\N	Laboratory	Mild skin irritation.	The affected area was washed immediately and the student was referred to Medical/Dental.	Engr. Carlo Reyes	Instructor	0918-456-7890
24	Jerome Santos	20	male	0920-567-8901	2026-07-16	BLDG-021	The student nearly tripped over an exposed cable.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:52:46.754052	2026-09-30 21:52:46.754052	\N	\N	Corridor	None.	The cable was secured and properly covered.	Mark Garcia	Student	0917-567-8902
25	Sarah Lim	21	female	0922-678-9012	2026-07-17	BLDG-022	The student accidentally touched a hot cooking surface.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 21:56:42.660337	2026-09-30 21:56:42.660337	\N	Minor Burn	Training Kitchen	Minor burn on the right hand.	The affected area was cooled with clean running water and first aid was provided.	Chef Mark Cruz	Instructor	0919-567-8902
26	Daniel Cruz	30	male	0918-678-9012	2026-07-20	BLDG-024	The fire alarm activated without visible signs of fire or smoke.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:25:54.572242	2026-09-30 22:25:54.572242	\N	False Fire Alarm	Ground Floor	\N	The building was checked and the alarm system was inspected.	Pedro Santos	Security Guard	0920-789-0123
27	Rene Butterbonia	44	male	0921-789-0123	2026-07-21	BLDG-025	A piece of construction material fell near a worker.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:33:15.461099	2026-09-30 22:33:15.461099	\N	Falling Object	Construction Area	\N	Work was temporarily stopped and materials were properly secured.	Ramon Magsaysay	Contract Supervisor	0917-789-0123
28	Kevin Ramos	21	male	0924-789-1234	2026-07-22	BLDG-027	The student slipped on a wet walkway after rainfall.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:45:49.954775	2026-09-30 22:45:49.954775	\N	\N	Outdoor Walkway	Minor scratches on both hands.	First aid was provided and the walkway was marked with a warning sign.	Adrian Cruz	Student	0918-789-1234
29	Rachel Flores	20	female	0920-890-1234	2026-09-28	BLDG-028	An exposed electrical wire was noticed near the lighting fixture.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:48:27.844115	2026-09-30 22:48:27.844115	\N	Exposed Wire	Gazebo lighting area	\N	The electrical supply was isolated and the wire was reported for repair.	Maria Santos	Student	0917-890-1234
30	Christopher Diaz	20	male	\N	2026-07-16	BLDG-029	The student experienced dizziness while waiting for a consultation.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:51:21.040253	2026-09-30 22:51:21.040253	\N	Dizziness	Waiting area	No physical injury.	The student was assisted to a resting area and assessed by medical personnel.	Nurse Anna Cruz	Medical Staff	\N
32	Angela Reyes	19	female	0921-890-2345	2026-10-01	BLDG-031	Students crowded near the entrance during an event.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:55:15.802395	2026-09-30 22:55:15.802395	\N	Crowd Congestion	Main entrance	\N	Security personnel controlled the crowd and opened an additional exit route.	Carlo Mendoza	Event Staff	0917-890-2345
33	Joshua Mendoza	20	male	0922-901-2345	2026-08-14	BLDG-032	The student lost balance during physical training.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:57:15.936532	2026-09-30 22:57:15.936532	\N	\N	Training area	Minor knee abrasion.	Training was paused and first aid was administered.	Sgt. Ramon Cruz	ROTC Instructor	0919-901-2345
34	John Carlo Flores	21	male	\N	2026-07-17	BLDG-033	The student experienced dizziness and weakness during physical activity.	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:58:46.069784	2026-09-30 22:58:46.069784	\N	Heat Exhaustion	Basketball area	\N	The student was moved to a shaded area, given water, and monitored.	Coach Maria Cruz	PE Instructor	0918-901-2345
13	Grace Mendoza	31	male	0927-000-1011	2026-07-03	BLDG-001	The staff member nearly tripped over an extension cord across the walkway.	\N	under_review	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 20:46:41.524576	2026-10-01 00:31:48.412039	\N	\N	Office Corridor	No injury.	Extension cord was secured and removed from the walkway.	Ana Cruz	Co-Worker	0927-000-2011
46	Gabe Norwood	31	male	0933-000-2222	2026-08-06	BLDG-033	Leg injury	\N	submitted	a531a376-9f40-47df-9931-8f36edef58b8	2026-10-01 00:37:06.58044	2026-10-01 00:37:06.58044	\N	\N	Basketball Court	\N	\N	Trae Young	Student	0944-1111-1122
31	Miguel Santos	22	male	0923-890-1234	2026-06-26	BLDG-030	The student landed awkwardly while playing basketball.	\N	under_review	a531a376-9f40-47df-9931-8f36edef58b8	2026-09-30 22:53:39.140805	2026-10-01 00:37:38.077492	\N	\N	Basketball court	Mild ankle sprain.	Activity was stopped and first aid was provided.	Coach Daniel Reyes	Sports Coach	0918-890-1234
\.


--
-- Data for Name: incident_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incident_types (incident_type_id, incident_id, incident_type) FROM stdin;
1	1	injury
2	1	near-hit
3	2	others
4	3	near-hit
5	4	injury
6	5	others
7	6	property-damage
8	7	injury
9	8	fire
10	9	injury
11	10	others
12	11	vehicle-event
13	12	injury
14	13	near-hit
15	14	property-damage
16	15	environment-event
17	16	injury
18	17	near-hit
19	18	injury
20	19	vehicle-event
21	20	injury
22	21	property-damage
23	22	near-hit
24	23	injury
25	24	near-hit
26	25	injury
27	26	fire
28	27	near-hit
29	28	injury
30	29	near-hit
31	30	injury
32	31	injury
33	32	near-hit
34	33	injury
35	34	injury
47	46	injury
\.


--
-- Data for Name: incident_workplace_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incident_workplace_roles (workplace_role_id, incident_id, workplace_role) FROM stdin;
1	1	Staff
2	1	Student
3	2	Student
4	2	Contractor
5	2	Visitor
6	3	Student
7	4	Staff
8	5	Student
9	6	Student
10	7	Student
11	8	Staff
12	9	Student
13	10	Staff
14	11	Visitor
15	12	Student
16	13	Staff
17	14	Student
18	15	Student
19	16	Staff
20	17	Student
21	18	Student
22	19	Staff
23	20	Student
24	21	Staff
25	22	Staff
26	23	Student
27	24	Student
28	25	Student
29	26	Staff
30	27	Contractor
31	28	Student
32	29	Student
33	30	Student
34	31	Student
35	32	Student
36	33	Student
37	34	Student
49	46	Visitor
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (notification_id, user_id, title, message, notification_type, report_type, report_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (name, applied_at) FROM stdin;
001_assessment_workflow.sql	2026-09-30 23:51:20.660177+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, email, password_hash, first_name, last_name, role, created_at) FROM stdin;
5e23c04f-888c-4851-a176-ff04b85c45f9	johnkennetharceo@pampangastateu.edu.ph	$2b$12$WqNjqpOQiMxjklegy0I40ev2TVP5eYh68Xmxbz4SsHqNOF17nkavW	John Kenneth	Arceo	employee	2026-09-30 04:09:58.245064
b137050a-a6ce-4934-bc30-8bf5ede878b0	gideobertsantos@pampangastateu.edu.ph	$2b$12$0VxGtEoFaVo/EU0P7E.n/.gZnU9XfgmWoqD9ZtV1MFPOu7DJQtRda	Gideon Bert	Santos	employee	2026-09-30 04:11:01.177476
6d2caea0-e997-4826-b7b5-2b51b4e7a33c	jamesguitierrez@pampangastateu.edu.ph	$2b$12$0e3qXHTrM6Ufxaz2wYr7EehtJh9hoA4UYZ6XBS6DpiVw7d5.5c0SK	James	Guitierrez	employee	2026-09-30 08:00:07.448404
d56eb62e-53a9-4865-b80c-542cc875faea	neilguintu@pampangastateu.edu.ph	$2b$12$T0RzYaC5bgP4.D2NIvJBc.Uh.ErKiZW3WioPRIDfX9gvsgZyQ0SFi	Neil	Guintu	employee	2026-09-30 08:00:30.548123
a531a376-9f40-47df-9931-8f36edef58b8	johnaspiras@pampangastate.edu.ph	$2b$12$Woq4e4N/Y0OdJ0XQQZLZy.Igdl0qfGlfBpZUOH5JJB4HDtOkbKHM.	John	Aspiras	employee	2026-09-30 18:43:21.499847
9c2a1d6a-ed09-4d7e-9f84-cfbe96309d7a	admin@pampangastate.edu.ph	$2b$12$j01n1NwX4Y0vlYyUFWb0vuLZTsOJzuD83dLyVqwM/U25ABiNmUNQy	adminn	OSHO	admin	2026-09-30 18:34:48.911056
628d48ef-b2ef-46d0-aae5-8385fe0574ec	gideonsantos@pampangastateu.edu.ph	$2b$12$IvrNHqXGS/xNXpKc5fDBY.USQcH/PbJ3DC.kMv4UVZc.5nFitWIHy	Gideon Bert	Santos	employee	2026-09-30 08:24:03.82762
f7751333-c7d8-4d8e-804f-e1ec17582f76	123@gmail.com	$2b$12$ErKqF3vzCHojIZzk8iYRy.c7oGDVFdWvAz1uNgJTOWiNNZHGevtX.	1	2	employee	2026-10-01 02:39:34.292865
\.


--
-- Name: building_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.building_id_seq', 59, true);


--
-- Name: hazard_assessments_assessment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hazard_assessments_assessment_id_seq', 25, true);


--
-- Name: hazard_report_affected_affected_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hazard_report_affected_affected_id_seq', 109, true);


--
-- Name: hazard_report_types_hazard_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hazard_report_types_hazard_type_id_seq', 78, true);


--
-- Name: hazard_reports_hazard_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hazard_reports_hazard_id_seq', 59, true);


--
-- Name: incident_assessments_assessment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incident_assessments_assessment_id_seq', 9, true);


--
-- Name: incident_natures_incident_nature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incident_natures_incident_nature_id_seq', 44, true);


--
-- Name: incident_reports_incident_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incident_reports_incident_id_seq', 46, true);


--
-- Name: incident_types_incident_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incident_types_incident_type_id_seq', 47, true);


--
-- Name: incident_workplace_roles_workplace_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incident_workplace_roles_workplace_role_id_seq', 49, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: buildings buildings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buildings
    ADD CONSTRAINT buildings_pkey PRIMARY KEY (building_id);


--
-- Name: hazard_assessments hazard_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_assessments
    ADD CONSTRAINT hazard_assessments_pkey PRIMARY KEY (assessment_id);


--
-- Name: hazard_report_affected hazard_report_affected_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_report_affected
    ADD CONSTRAINT hazard_report_affected_pkey PRIMARY KEY (affected_id);


--
-- Name: hazard_report_types hazard_report_types_hazard_id_hazard_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_report_types
    ADD CONSTRAINT hazard_report_types_hazard_id_hazard_type_key UNIQUE (hazard_id, hazard_type);


--
-- Name: hazard_report_types hazard_report_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_report_types
    ADD CONSTRAINT hazard_report_types_pkey PRIMARY KEY (hazard_type_id);


--
-- Name: hazard_reports hazard_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_pkey PRIMARY KEY (hazard_id);


--
-- Name: incident_assessments incident_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_assessments
    ADD CONSTRAINT incident_assessments_pkey PRIMARY KEY (assessment_id);


--
-- Name: incident_natures incident_natures_incident_id_incident_nature_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_natures
    ADD CONSTRAINT incident_natures_incident_id_incident_nature_key UNIQUE (incident_id, incident_nature);


--
-- Name: incident_natures incident_natures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_natures
    ADD CONSTRAINT incident_natures_pkey PRIMARY KEY (incident_nature_id);


--
-- Name: incident_reports incident_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_pkey PRIMARY KEY (incident_id);


--
-- Name: incident_types incident_types_incident_id_incident_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_incident_id_incident_type_key UNIQUE (incident_id, incident_type);


--
-- Name: incident_types incident_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_pkey PRIMARY KEY (incident_type_id);


--
-- Name: incident_workplace_roles incident_workplace_roles_incident_id_workplace_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_workplace_roles
    ADD CONSTRAINT incident_workplace_roles_incident_id_workplace_role_key UNIQUE (incident_id, workplace_role);


--
-- Name: incident_workplace_roles incident_workplace_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_workplace_roles
    ADD CONSTRAINT incident_workplace_roles_pkey PRIMARY KEY (workplace_role_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: hazard_assessments_one_per_report; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hazard_assessments_one_per_report ON public.hazard_assessments USING btree (hazard_id);


--
-- Name: idx_one_assessment_per_hazard; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_one_assessment_per_hazard ON public.hazard_assessments USING btree (hazard_id);


--
-- Name: idx_one_assessment_per_incident; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_one_assessment_per_incident ON public.incident_assessments USING btree (incident_id);


--
-- Name: incident_assessments_one_per_report; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX incident_assessments_one_per_report ON public.incident_assessments USING btree (incident_id);


--
-- Name: hazard_assessments hazard_assessments_assessed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_assessments
    ADD CONSTRAINT hazard_assessments_assessed_by_fkey FOREIGN KEY (assessed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: hazard_assessments hazard_assessments_hazard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_assessments
    ADD CONSTRAINT hazard_assessments_hazard_id_fkey FOREIGN KEY (hazard_id) REFERENCES public.hazard_reports(hazard_id) ON DELETE CASCADE;


--
-- Name: hazard_assessments hazard_assessments_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_assessments
    ADD CONSTRAINT hazard_assessments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: hazard_reports hazard_reports_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(building_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: hazard_reports hazard_reports_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazard_reports
    ADD CONSTRAINT hazard_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: incident_assessments incident_assessments_assessed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_assessments
    ADD CONSTRAINT incident_assessments_assessed_by_fkey FOREIGN KEY (assessed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: incident_assessments incident_assessments_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_assessments
    ADD CONSTRAINT incident_assessments_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incident_reports(incident_id) ON DELETE CASCADE;


--
-- Name: incident_assessments incident_assessments_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_assessments
    ADD CONSTRAINT incident_assessments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: incident_natures incident_natures_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_natures
    ADD CONSTRAINT incident_natures_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incident_reports(incident_id) ON DELETE CASCADE;


--
-- Name: incident_reports incident_reports_building_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_building_id_fkey FOREIGN KEY (building_id) REFERENCES public.buildings(building_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: incident_reports incident_reports_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_reports
    ADD CONSTRAINT incident_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: incident_types incident_types_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_types
    ADD CONSTRAINT incident_types_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incident_reports(incident_id) ON DELETE CASCADE;


--
-- Name: incident_workplace_roles incident_workplace_roles_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incident_workplace_roles
    ADD CONSTRAINT incident_workplace_roles_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incident_reports(incident_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nK2RKeRdJVtAaZuRhpsTJfOqImD3cEimMuSt5YZfZgtWMeq7qtFd5W9h1nq1i45

