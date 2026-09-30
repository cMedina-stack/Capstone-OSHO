--
-- PostgreSQL database dump
--

\restrict VuAq1LOZVFc41Y8shSdCIBXwnfamVRWfKJtDrsfhz3hg7PYkuZRjqY7KoqIZpbp

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


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
-- PostgreSQL database dump complete
--

\unrestrict VuAq1LOZVFc41Y8shSdCIBXwnfamVRWfKJtDrsfhz3hg7PYkuZRjqY7KoqIZpbp

