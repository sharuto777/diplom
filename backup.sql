--
-- PostgreSQL database dump
--

\restrict oiY0fs6HHXXdh0kpl7x7LjyPdm6UuLIryT5peYcbTNMor7ENMRPscmrvKB358ca

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-31 22:49:24

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
-- TOC entry 2 (class 3079 OID 57349)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 928 (class 1247 OID 57416)
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'expired',
    'cancelled'
);


ALTER TYPE public.subscription_status OWNER TO postgres;

--
-- TOC entry 922 (class 1247 OID 57402)
-- Name: task_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.task_priority OWNER TO postgres;

--
-- TOC entry 919 (class 1247 OID 57388)
-- Name: task_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_status AS ENUM (
    'new',
    'in_progress',
    'planned',
    'completed',
    'missed',
    'cancelled'
);


ALTER TYPE public.task_status OWNER TO postgres;

--
-- TOC entry 925 (class 1247 OID 57410)
-- Name: task_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_type AS ENUM (
    'regular',
    'workout'
);


ALTER TYPE public.task_type OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 57728)
-- Name: save_task_status_history(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_task_status_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_history (
            task_id,
            old_status,
            new_status
        )
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.save_task_status_history() OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 57723)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 57668)
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    task_id uuid,
    title character varying(150) NOT NULL,
    description text,
    start_datetime timestamp without time zone NOT NULL,
    end_datetime timestamp without time zone,
    color character varying(20) DEFAULT '#059669'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_calendar_event_time CHECK (((end_datetime IS NULL) OR (end_datetime >= start_datetime)))
);


ALTER TABLE public.calendar_events OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE calendar_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.calendar_events IS 'События календаря. Могут быть связаны с задачами';


--
-- TOC entry 240 (class 1259 OID 90118)
-- Name: exercise_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(80) NOT NULL,
    color character varying(20) DEFAULT '#E6F8FA'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exercise_groups OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 106529)
-- Name: exercise_guides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_guides (
    id integer NOT NULL,
    exercise_id integer NOT NULL,
    technique jsonb DEFAULT '[]'::jsonb NOT NULL,
    combinations jsonb DEFAULT '[]'::jsonb NOT NULL,
    tips jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exercise_guides OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 106528)
-- Name: exercise_guides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercise_guides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_guides_id_seq OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 242
-- Name: exercise_guides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercise_guides_id_seq OWNED BY public.exercise_guides.id;


--
-- TOC entry 227 (class 1259 OID 57571)
-- Name: exercise_muscle_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_muscle_groups (
    exercise_id integer NOT NULL,
    muscle_group_id integer NOT NULL,
    is_primary boolean DEFAULT true NOT NULL
);


ALTER TABLE public.exercise_muscle_groups OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE exercise_muscle_groups; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.exercise_muscle_groups IS 'Связь упражнений с группами мышц';


--
-- TOC entry 226 (class 1259 OID 57553)
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    difficulty character varying(30) DEFAULT 'Средняя'::character varying NOT NULL,
    equipment character varying(120),
    is_premium boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name_ru character varying(160),
    description_ru text,
    source character varying(80),
    source_id character varying(120),
    external_category integer,
    external_muscles jsonb,
    external_equipment jsonb,
    measure_type character varying(30) DEFAULT 'weight_reps'::character varying,
    measure_units jsonb DEFAULT '["kg"]'::jsonb,
    group_id uuid
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE exercises; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.exercises IS 'Библиотека упражнений';


--
-- TOC entry 225 (class 1259 OID 57552)
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_id_seq OWNER TO postgres;

--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 225
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- TOC entry 246 (class 1259 OID 122884)
-- Name: friend_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friend_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT friend_requests_not_self CHECK ((sender_id <> receiver_id)),
    CONSTRAINT friend_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying])::text[])))
);


ALTER TABLE public.friend_requests OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 57591)
-- Name: muscle_group_combinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscle_group_combinations (
    id integer NOT NULL,
    main_muscle_group_id integer NOT NULL,
    recommended_muscle_group_id integer NOT NULL,
    description text,
    CONSTRAINT no_same_muscle_combination CHECK ((main_muscle_group_id <> recommended_muscle_group_id))
);


ALTER TABLE public.muscle_group_combinations OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE muscle_group_combinations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.muscle_group_combinations IS 'Рекомендации совместимых групп мышц';


--
-- TOC entry 228 (class 1259 OID 57590)
-- Name: muscle_group_combinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.muscle_group_combinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muscle_group_combinations_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 228
-- Name: muscle_group_combinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.muscle_group_combinations_id_seq OWNED BY public.muscle_group_combinations.id;


--
-- TOC entry 224 (class 1259 OID 57540)
-- Name: muscle_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.muscle_groups (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    description text
);


ALTER TABLE public.muscle_groups OWNER TO postgres;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE muscle_groups; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.muscle_groups IS 'Группы мышц: спина, грудь, ноги, плечи, пресс и т.д.';


--
-- TOC entry 223 (class 1259 OID 57539)
-- Name: muscle_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.muscle_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muscle_groups_id_seq OWNER TO postgres;

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 223
-- Name: muscle_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.muscle_groups_id_seq OWNED BY public.muscle_groups.id;


--
-- TOC entry 236 (class 1259 OID 73787)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    price_month numeric(10,2) DEFAULT 0 NOT NULL,
    price_year numeric(10,2) DEFAULT 0 NOT NULL,
    max_tasks integer,
    max_workouts integer,
    has_extended_stats boolean DEFAULT false NOT NULL,
    has_extended_exercises boolean DEFAULT false NOT NULL,
    has_ready_programs boolean DEFAULT false NOT NULL,
    has_progress_history boolean DEFAULT false NOT NULL,
    has_export boolean DEFAULT false NOT NULL,
    has_no_ads boolean DEFAULT false NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 57492)
-- Name: task_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(20) DEFAULT '#64748b'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_categories OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE task_categories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.task_categories IS 'Категории задач: личное, учёба, работа, здоровье, тренировка';


--
-- TOC entry 220 (class 1259 OID 57491)
-- Name: task_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 220
-- Name: task_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_categories_id_seq OWNED BY public.task_categories.id;


--
-- TOC entry 234 (class 1259 OID 65540)
-- Name: task_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(80) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    color character varying(20) DEFAULT '#E6F8FA'::character varying NOT NULL
);


ALTER TABLE public.task_groups OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 57696)
-- Name: task_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    old_status public.task_status,
    new_status public.task_status NOT NULL,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_history OWNER TO postgres;

--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE task_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.task_history IS 'История изменения статусов задач';


--
-- TOC entry 222 (class 1259 OID 57505)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id integer,
    title character varying(150) NOT NULL,
    description text,
    task_type public.task_type DEFAULT 'regular'::public.task_type NOT NULL,
    status public.task_status DEFAULT 'new'::public.task_status NOT NULL,
    priority public.task_priority DEFAULT 'medium'::public.task_priority NOT NULL,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    is_premium boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    group_id uuid,
    micro_step text,
    subtasks jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT check_task_time CHECK (((end_datetime IS NULL) OR (start_datetime IS NULL) OR (end_datetime >= start_datetime)))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tasks IS 'Основная таблица задач. Тренировка является специальным типом задачи';


--
-- TOC entry 245 (class 1259 OID 106590)
-- Name: user_activity_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_activity_days (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    activity_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_activity_days OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 106589)
-- Name: user_activity_days_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_activity_days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_activity_days_id_seq OWNER TO postgres;

--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_activity_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_activity_days_id_seq OWNED BY public.user_activity_days.id;


--
-- TOC entry 239 (class 1259 OID 81969)
-- Name: user_exercise_metric_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_exercise_metric_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_id uuid NOT NULL,
    user_id uuid NOT NULL,
    measure_type character varying(30) NOT NULL,
    weight_kg numeric(6,2),
    reps_count integer,
    sets_count integer,
    distance_km numeric(6,2),
    duration_seconds integer,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_user_exercise_metric_history_type CHECK (((measure_type)::text = ANY ((ARRAY['weight_reps'::character varying, 'distance_time'::character varying, 'time_sets'::character varying])::text[])))
);


ALTER TABLE public.user_exercise_metric_history OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 81938)
-- Name: user_exercise_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_exercise_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_id integer,
    custom_exercise_name character varying(120),
    measure_type character varying(30) DEFAULT 'weight_reps'::character varying NOT NULL,
    weight_kg numeric(6,2),
    reps_count integer,
    sets_count integer,
    distance_km numeric(6,2),
    duration_seconds integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_user_exercise_metric_distance CHECK (((distance_km IS NULL) OR (distance_km >= (0)::numeric))),
    CONSTRAINT check_user_exercise_metric_duration CHECK (((duration_seconds IS NULL) OR (duration_seconds > 0))),
    CONSTRAINT check_user_exercise_metric_name CHECK (((exercise_id IS NOT NULL) OR (custom_exercise_name IS NOT NULL))),
    CONSTRAINT check_user_exercise_metric_reps CHECK (((reps_count IS NULL) OR (reps_count > 0))),
    CONSTRAINT check_user_exercise_metric_sets CHECK (((sets_count IS NULL) OR (sets_count > 0))),
    CONSTRAINT check_user_exercise_metric_type CHECK (((measure_type)::text = ANY ((ARRAY['weight_reps'::character varying, 'distance_time'::character varying, 'time_sets'::character varying])::text[]))),
    CONSTRAINT check_user_exercise_metric_weight CHECK (((weight_kg IS NULL) OR (weight_kg >= (0)::numeric)))
);


ALTER TABLE public.user_exercise_metrics OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 90143)
-- Name: user_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    difficulty character varying(30) DEFAULT 'Средняя'::character varying NOT NULL,
    equipment character varying(120),
    is_premium boolean DEFAULT false NOT NULL,
    measure_type character varying(30) DEFAULT 'weight_reps'::character varying NOT NULL,
    measure_units jsonb DEFAULT '["kg"]'::jsonb,
    group_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_exercises OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 122912)
-- Name: user_friends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_friends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    friend_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_friends_not_self CHECK ((user_id <> friend_id))
);


ALTER TABLE public.user_friends OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 73822)
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status character varying(30) DEFAULT 'active'::character varying NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.user_subscriptions OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 73762)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(80) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(30) DEFAULT 'user'::character varying NOT NULL,
    is_guest boolean DEFAULT false NOT NULL,
    avatar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 57642)
-- Name: workout_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workout_id uuid NOT NULL,
    exercise_id integer,
    sets_count integer,
    reps_count integer,
    weight_kg numeric(6,2),
    exercise_order integer DEFAULT 1 NOT NULL,
    notes text,
    is_completed boolean DEFAULT false,
    user_exercise_id uuid,
    CONSTRAINT check_reps_count CHECK (((reps_count IS NULL) OR (reps_count > 0))),
    CONSTRAINT check_sets_count CHECK ((sets_count >= 0)),
    CONSTRAINT check_weight CHECK (((weight_kg IS NULL) OR (weight_kg >= (0)::numeric)))
);


ALTER TABLE public.workout_exercises OWNER TO postgres;

--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE workout_exercises; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.workout_exercises IS 'Упражнения, выбранные пользователем для тренировки';


--
-- TOC entry 230 (class 1259 OID 57615)
-- Name: workouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid NOT NULL,
    main_muscle_group_id integer,
    duration_minutes integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    repeat_days text[] DEFAULT '{}'::text[],
    CONSTRAINT check_duration CHECK (((duration_minutes IS NULL) OR (duration_minutes > 0)))
);


ALTER TABLE public.workouts OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE workouts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.workouts IS 'Тренировочная информация, связанная с задачей типа workout';


--
-- TOC entry 4969 (class 2604 OID 106532)
-- Name: exercise_guides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_guides ALTER COLUMN id SET DEFAULT nextval('public.exercise_guides_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 57556)
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 57594)
-- Name: muscle_group_combinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations ALTER COLUMN id SET DEFAULT nextval('public.muscle_group_combinations_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 57543)
-- Name: muscle_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups ALTER COLUMN id SET DEFAULT nextval('public.muscle_groups_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 57495)
-- Name: task_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories ALTER COLUMN id SET DEFAULT nextval('public.task_categories_id_seq'::regclass);


--
-- TOC entry 4975 (class 2604 OID 106593)
-- Name: user_activity_days id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_days ALTER COLUMN id SET DEFAULT nextval('public.user_activity_days_id_seq'::regclass);


--
-- TOC entry 5294 (class 0 OID 57668)
-- Dependencies: 232
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (id, user_id, task_id, title, description, start_datetime, end_datetime, color, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5302 (class 0 OID 90118)
-- Dependencies: 240
-- Data for Name: exercise_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercise_groups (id, user_id, name, color, created_at) FROM stdin;
fe4c162a-337f-4df8-a518-15adcc054184	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Спина	#E6F8FA	2026-05-19 10:43:27.21257
aa3ba5ee-b20a-40cb-815a-9b28d4cb9ea4	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Грудь	#ECFDF5	2026-05-19 10:43:27.21257
050c9a3a-4ea6-4ad0-a6c8-9a99332de9e3	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Ноги	#FFFBEB	2026-05-19 10:43:27.21257
2345b207-c5c4-491e-ad2f-fb6f09cf0648	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Плечи	#F5F3FF	2026-05-19 10:43:27.21257
bb9c346a-79bc-40b5-8e6b-9f60d4666e36	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Бицепс	#EFF6FF	2026-05-19 10:43:27.21257
5f7d46fd-6229-40cd-a36b-1665d3072afd	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Трицепс	#FEF2F2	2026-05-19 10:43:27.21257
969f810d-dc95-4d20-9b72-6eb3b59c2e3e	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Пресс	#F8FAFC	2026-05-19 10:43:27.21257
9a93786c-4dd5-441c-bd68-a897b2873823	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Ягодицы	#FCE7F3	2026-05-19 10:43:27.21257
4f28c40e-878b-4bd9-8e8c-06949db51811	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Кардио	#E0F2FE	2026-05-19 10:43:27.21257
d2b0818a-8dee-437e-a679-8311e9abc050	93ab140f-e796-40d9-99ae-76a4b954ec20	бум бум бум	#FEF2F2	2026-05-19 11:07:01.676972
1254d46d-73f5-4065-9a4c-b64736c273a4	0ce96fe6-1b90-4816-a93e-f388ba244b19	21	#E6F8FA	2026-05-26 00:14:24.893533
6b96315c-9df7-4288-8df9-1fdaa74bd15b	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	авыа	#FEF2F2	2026-05-27 21:20:16.729198
\.


--
-- TOC entry 5305 (class 0 OID 106529)
-- Dependencies: 243
-- Data for Name: exercise_guides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercise_guides (id, exercise_id, technique, combinations, tips, created_at, updated_at) FROM stdin;
1	1	["Возьмитесь за перекладину хватом немного шире плеч и повисните, не раскачивая корпус.", "Перед началом движения опустите плечи от ушей и слегка сведите лопатки.", "Подтягивайтесь грудью к перекладине, ведя локти вниз и назад.", "Опускайтесь подконтрольно почти до полного выпрямления рук, сохраняя напряжение в спине."]	["Тяга верхнего блока — подходит как дополнительное движение после подтягиваний.", "Тяга гантели в наклоне — поможет отдельно проработать каждую сторону спины.", "Сгибания на бицепс — можно поставить после основных тяг."]	["Не начинайте подъём рывком с плеч и поясницы.", "Если тяжело, используйте резину или тренажёр с противовесом.", "Старайтесь тянуться грудью вверх, а не просто подбородком к турнику."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
2	2	["Сядьте в тренажёр, зафиксируйте бёдра под валиками и возьмитесь за рукоять широким или средним хватом.", "Слегка отклоните корпус назад и опустите плечи, чтобы движение начиналось со спины.", "Тяните рукоять к верхней части груди, направляя локти вниз.", "Возвращайте рукоять вверх медленно, не отпуская вес резко."]	["Подтягивания — хорошая базовая альтернатива для широчайших.", "Горизонтальная тяга — дополнит вертикальную тягу нагрузкой на середину спины.", "Сгибания рук с гантелями — можно добавить после тяг на бицепс."]	["Не тяните рукоять за голову, если это вызывает дискомфорт в плечах.", "Не раскачивайте корпус ради большего веса.", "В нижней точке делайте короткую паузу и ощущайте работу широчайших."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
3	3	["Поставьте стопы устойчиво, возьмите штангу хватом немного шире плеч.", "Наклоните корпус вперёд с ровной спиной и слегка согнутыми коленями.", "Тяните штангу к нижней части живота, ведя локти назад.", "Опускайте штангу подконтрольно, не округляя поясницу."]	["Становая тяга — можно использовать как базовое движение в начале тренировки спины.", "Тяга верхнего блока — дополнит горизонтальную тягу вертикальной.", "Разведения в наклоне — помогут добавить работу задней дельты."]	["Держите шею нейтрально, не задирайте голову.", "Не превращайте упражнение в рывок корпусом.", "Начинайте с веса, при котором спина остаётся ровной весь подход."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
4	4	["Сядьте в тренажёр и упритесь стопами в платформы.", "Возьмитесь за рукоять, выпрямите спину и слегка отведите плечи назад.", "Тяните рукоять к животу, сводя лопатки в конце движения.", "Возвращайте руки вперёд подконтрольно, не округляя спину."]	["Тяга верхнего блока — хорошо сочетается для полной тренировки спины.", "Тяга Т-грифа — можно использовать как более тяжёлый вариант.", "Тяга каната к лицу — добавит нагрузку на заднюю дельту и верх спины."]	["Не заваливайтесь назад всем корпусом.", "В конце тяги не поднимайте плечи к ушам.", "Держите движение плавным, особенно на возврате веса."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
5	5	["Настройте тренажёр так, чтобы край опоры находился ниже таза.", "Зафиксируйте ноги и скрестите руки на груди или держите их у головы.", "Опускайтесь вниз с ровной спиной до комфортной амплитуды.", "Поднимайтесь до линии корпуса, не переразгибая поясницу."]	["Румынская тяга — хорошо дополняет работу задней поверхности бедра.", "Ягодичный мост — можно добавить для акцента на ягодицы.", "Планка — поможет укрепить корпус после разгибателей спины."]	["Не поднимайтесь слишком высоко, чтобы не перегружать поясницу.", "Движение должно идти через тазобедренный сустав, а не через резкий прогиб.", "Для усложнения можно держать диск у груди, но только при стабильной технике."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
6	6	["Лягте на скамью так, чтобы глаза были примерно под грифом.", "Сведите лопатки, поставьте стопы на пол и создайте устойчивое положение корпуса.", "Снимите штангу и опускайте её к нижней части груди подконтрольно.", "Выжимайте штангу вверх без отбива от груди и без потери положения лопаток."]	["Жим гантелей лёжа — добавит большую амплитуду движения.", "Сведение рук в тренажёре — можно поставить после жима для изоляции груди.", "Разгибание рук на блоке — хорошо дополнит тренировку груди и трицепса."]	["Не отрывайте таз от скамьи.", "Не разводите локти строго в стороны — держите умеренный угол.", "При тяжёлом весе используйте страховку."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
7	7	["Сядьте на скамью, возьмите гантели и аккуратно лягте, удерживая их у груди.", "Поставьте стопы устойчиво, сведите лопатки и держите грудь раскрытой.", "Выжимайте гантели вверх по дуге, не сталкивая их резко в верхней точке.", "Опускайте гантели до комфортной глубины, сохраняя контроль плеч."]	["Жим лёжа — можно использовать как основное силовое движение.", "Разводка гантелей — дополнит жим растяжением грудных мышц.", "Кроссовер — подойдёт для завершения тренировки груди."]	["Не опускайте гантели слишком низко, если плечи теряют комфорт.", "Не выпрямляйте локти резко до жёсткой блокировки.", "Следите, чтобы обе руки двигались симметрично."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
8	8	["Лягте на скамью и поднимите гантели над грудью с чуть согнутыми локтями.", "Медленно разводите руки в стороны, сохраняя одинаковый угол в локтях.", "Опускайтесь до комфортного растяжения груди без боли в плечах.", "Сводите руки обратно над грудью, не превращая движение в жим."]	["Жим гантелей лёжа — лучше выполнять перед разводкой.", "Сведение рук в тренажёре — похожее изолирующее движение для груди.", "Кроссовер — можно использовать как альтернативу на блоках."]	["Работайте с умеренным весом, здесь важнее контроль, а не рекорд.", "Не выпрямляйте локти полностью.", "Не опускайте руки ниже уровня, где плечи чувствуют себя стабильно."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
9	9	["Возьмитесь за брусья и выйдите в верхнее положение на прямых руках.", "Слегка наклоните корпус вперёд, если хотите сильнее включить грудь.", "Опускайтесь вниз подконтрольно, сгибая локти и сохраняя плечи стабильными.", "Поднимайтесь вверх без раскачки, выжимая себя руками и грудью."]	["Жим лёжа — хорошо сочетается как базовое упражнение на грудь.", "Разгибание рук на блоке — можно добавить после брусьев для трицепса.", "Отжимания — подойдут как более лёгкий вариант."]	["Не проваливайтесь плечами в нижней точке.", "Не опускайтесь слишком глубоко, если появляется дискомфорт.", "Для упрощения используйте резину или тренажёр с противовесом."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
10	10	["Встаньте между блоками, возьмите рукояти и сделайте небольшой шаг вперёд.", "Слегка наклоните корпус и зафиксируйте мягкий угол в локтях.", "Сводите руки перед собой по дуге, концентрируясь на сокращении грудных мышц.", "Возвращайте рукояти назад медленно, не позволяя весу тянуть плечи."]	["Жим штанги на наклонной скамье — можно поставить перед кроссовером.", "Разводка гантелей — похожее изолирующее движение.", "Сведение рук в тренажёре — альтернатива для более стабильной траектории."]	["Не берите слишком большой вес, чтобы не подключать корпус.", "В конце движения можно делать короткую паузу.", "Следите, чтобы плечи не поднимались к ушам."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
11	11	["Расположите штангу на верхней части спины и снимите её со стоек.", "Поставьте стопы примерно на ширине плеч, носки слегка разверните наружу.", "Опускайтесь вниз, отводя таз назад и контролируя направление коленей.", "Поднимайтесь вверх через всю стопу, сохраняя спину ровной."]	["Румынская тяга — дополнит приседания работой задней поверхности бедра.", "Жим ногами — можно добавить после приседаний для объёма ног.", "Планка — поможет укрепить корпус для базовых движений."]	["Не округляйте спину в нижней точке.", "Следите, чтобы колени двигались в сторону носков.", "Начинайте с веса, при котором глубина и техника остаются стабильными."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
12	12	["Сядьте в тренажёр и плотно прижмите спину к спинке.", "Поставьте стопы на платформу на комфортной ширине.", "Опускайте платформу до безопасной глубины, не отрывая таз от сиденья.", "Выжимайте платформу вверх, не блокируя колени резко."]	["Приседания со штангой — можно выполнять перед жимом ногами.", "Разгибание ног — добавит изоляцию квадрицепса после жима.", "Подъём на носки — удобно поставить в конце тренировки ног."]	["Не сводите колени внутрь при подъёме.", "Не опускайте платформу настолько низко, чтобы поясница округлялась.", "Не выпрямляйте колени до резкого замка."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
13	13	["Встаньте прямо, возьмите гантели или работайте с собственным весом.", "Сделайте шаг вперёд и опускайтесь вниз до устойчивого положения.", "Переднее колено направляйте по линии носка, корпус держите ровно.", "Оттолкнитесь передней ногой и вернитесь в исходное положение."]	["Приседания — можно выполнять перед выпадами как базовое движение.", "Болгарские выпады — более сложная односторонняя альтернатива.", "Ягодичный мост — хорошо дополнит работу ягодиц."]	["Не делайте слишком короткий шаг, чтобы колено не уходило резко вперёд.", "Сохраняйте баланс и не заваливайтесь в стороны.", "Начинайте без веса, если техника ещё нестабильна."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
14	14	["Возьмите штангу прямым хватом и поставьте стопы на ширине таза.", "Слегка согните колени и отводите таз назад, опуская штангу вдоль ног.", "Держите спину ровной, а штангу близко к телу.", "Поднимайтесь вверх за счёт разгибания таза и работы задней поверхности бедра."]	["Приседания со штангой — хорошо сочетаются как базовое движение на ноги.", "Сгибание ног — дополнит румынскую тягу изоляцией бицепса бедра.", "Хип-траст — добавит акцент на ягодицы."]	["Не округляйте поясницу.", "Не приседайте слишком сильно — движение должно быть через таз.", "Опускайтесь только до той глубины, где сохраняется ровная спина."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
15	15	["Встаньте в тренажёр или на платформу так, чтобы стопы стояли устойчиво.", "Опустите пятки вниз до комфортного растяжения икр.", "Поднимайтесь на носки максимально высоко, не заваливая стопы внутрь.", "Опускайтесь медленно, сохраняя контроль в нижней фазе."]	["Жим ногами — можно выполнить перед подъёмами на носки.", "Подъём на носки сидя — дополнит упражнение акцентом на камбаловидную мышцу.", "Ходьба на дорожке — подойдёт для лёгкого завершения тренировки ног."]	["Не пружиньте в нижней точке.", "Делайте паузу в верхней точке для лучшего сокращения.", "Следите, чтобы движение происходило в голеностопе, а не за счёт корпуса."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
16	16	["Лягте на коврик, согните ноги и поставьте стопы на пол.", "Слегка прижмите поясницу к полу и напрягите пресс.", "Поднимайте верх корпуса за счёт скручивания, а не рывка шеей.", "Медленно возвращайтесь вниз, сохраняя напряжение в животе."]	["Планка — хорошо сочетается со скручиваниями для общей стабильности корпуса.", "Обратные скручивания — добавят акцент на нижнюю часть пресса.", "Косые скручивания — дополнят работу боковых мышц живота."]	["Не тяните голову руками.", "Не поднимайте корпус слишком высоко, если теряется работа пресса.", "Дышите спокойно: выдох на подъёме, вдох на опускании."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
17	17	["Примите упор на локтях, расположив их под плечами.", "Выпрямите тело в одну линию от головы до пяток.", "Напрягите пресс и ягодицы, не позволяя пояснице провисать.", "Держите положение заданное время, сохраняя ровное дыхание."]	["Боковая планка — дополнит обычную планку работой косых мышц.", "Подъём ног лёжа — можно добавить для нижней части пресса.", "Гиперэкстензия — поможет сбалансировать работу корпуса."]	["Не задирайте таз слишком высоко.", "Не задерживайте дыхание.", "Лучше держать меньше времени с идеальной техникой, чем долго с провисшей поясницей."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
18	18	["Лягте на спину и вытяните ноги или слегка согните их в коленях.", "Прижмите поясницу к полу и напрягите пресс.", "Поднимайте ноги вверх подконтрольно, не раскачивая корпус.", "Опускайте ноги медленно до уровня, где поясница не отрывается от пола."]	["Скручивания — хорошо сочетаются для верхней части пресса.", "Планка — добавит статическую нагрузку на корпус.", "Обратные скручивания — похожее движение с акцентом на таз."]	["Не опускайте ноги слишком низко, если поясница выгибается.", "Не используйте рывок ногами.", "Для упрощения согните колени."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
19	19	["Лягте на спину, поднимите ноги и заведите руки за голову без давления на шею.", "Поочерёдно тяните локоть к противоположному колену.", "Вторую ногу выпрямляйте подконтрольно, не бросая её вниз.", "Сохраняйте постоянное напряжение пресса на протяжении подхода."]	["Скручивания — можно поставить перед велосипедом для разогрева пресса.", "Русские повороты — добавят работу косых мышц.", "Планка — закрепит стабильность корпуса после динамики."]	["Не тяните шею руками.", "Не ускоряйтесь до потери контроля.", "Держите поясницу ближе к полу."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
20	20	["Сядьте на коврик, слегка отклоните корпус назад и согните ноги.", "Держите спину ровной, а пресс напряжённым.", "Поворачивайте корпус влево и вправо, ведя движение плечами, а не только руками.", "Возвращайтесь через центр подконтрольно, не раскачиваясь."]	["Скручивания — можно выполнить перед русскими поворотами.", "Боковая планка — хорошо дополняет работу косых мышц.", "Планка — подойдёт для завершения блока на корпус."]	["Не округляйте спину.", "Начинайте без дополнительного веса.", "Если тяжело удерживать баланс, поставьте стопы на пол."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
21	25	["Поставьте одно колено и руку на скамью, второй ногой упритесь в пол.", "Возьмите гантель свободной рукой и опустите её вниз под плечом.", "Тяните гантель к поясу, ведя локоть назад вдоль корпуса.", "Опускайте гантель медленно, сохраняя ровную спину."]	["Тяга штанги в наклоне — базовая двусторонняя альтернатива.", "Горизонтальная тяга — дополнит работу середины спины.", "Подтягивания — хорошо сочетаются для вертикальной тяги."]	["Не разворачивайте корпус слишком сильно в верхней точке.", "Не поднимайте плечо к уху.", "Работайте одинаково на обе стороны."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
22	28	["Подойдите к штанге так, чтобы гриф был над серединой стопы.", "Возьмитесь за гриф, согните колени и зафиксируйте ровную спину.", "Начинайте подъём, одновременно разгибая ноги и таз, удерживая штангу близко к телу.", "Опускайте штангу обратно по той же траектории, сохраняя контроль."]	["Гиперэкстензия — можно использовать как вспомогательное упражнение.", "Тяга верхнего блока — добавит нагрузку на широчайшие после становой.", "Сгибание ног — дополнит работу задней поверхности бедра."]	["Не округляйте спину перед отрывом штанги.", "Не тяните штангу руками — руки служат крюками.", "Сначала отработайте технику с лёгким весом."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
23	30	["Лягте на горизонтальную скамью и удерживайте гантели у груди.", "Сведите лопатки и поставьте стопы на пол.", "Выжимайте гантели вверх, сохраняя контроль и симметрию движения.", "Опускайте гантели плавно до комфортной глубины."]	["Жим лёжа — можно выполнять как основное силовое движение.", "Разводка гантелей — хорошо идёт после жима для растяжения груди.", "Разгибание рук на блоке — добавит работу трицепса."]	["Не сталкивайте гантели в верхней точке.", "Не допускайте заваливания кистей назад.", "Опускайте вес медленно, особенно в последних повторениях."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
24	31	["Установите скамью под умеренным наклоном и сядьте с гантелями.", "Лягте, сведите лопатки и держите гантели у верхней части груди.", "Выжимайте гантели вверх и немного внутрь, не теряя контроля плеч.", "Опускайте гантели до комфортной глубины, сохраняя напряжение в верхе груди."]	["Жим штанги на наклонной скамье — похожий базовый вариант.", "Кроссовер снизу вверх — хорошо дополнит верх груди.", "Сведение рук в тренажёре — можно поставить в конце тренировки."]	["Не ставьте наклон слишком высоким, чтобы не перенести нагрузку полностью на плечи.", "Не прогибайтесь чрезмерно в пояснице.", "Следите за одинаковой траекторией обеих гантелей."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
25	34	["Примите упор лёжа, расположив ладони чуть шире плеч.", "Выпрямите тело в одну линию и напрягите пресс.", "Опускайтесь к полу, сгибая локти под умеренным углом.", "Отжимайтесь вверх без провисания поясницы."]	["Жим гантелей лёжа — силовая альтернатива на грудь.", "Отжимания узким хватом — усилят акцент на трицепс.", "Планка — поможет укрепить корпус для стабильной техники."]	["Не разводите локти строго в стороны.", "Не опускайте голову вниз отдельно от корпуса.", "Для упрощения выполняйте отжимания от возвышения."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
26	36	["Поставьте стопы примерно на ширине плеч и слегка разверните носки наружу.", "Держите корпус ровно, взгляд направьте вперёд.", "Опускайтесь вниз, отводя таз назад и сгибая колени.", "Поднимайтесь через всю стопу, не заваливая колени внутрь."]	["Выпады — добавят одностороннюю нагрузку на ноги.", "Ягодичный мост — хорошо дополнит работу ягодиц.", "Подъём на носки стоя — можно поставить в конце тренировки ног."]	["Не отрывайте пятки от пола.", "Не округляйте спину в нижней точке.", "Сначала освойте движение без веса."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
27	39	["Встаньте спиной к скамье и поставьте заднюю ногу на опору.", "Переднюю стопу расположите так, чтобы при опускании колено двигалось комфортно.", "Опускайтесь вниз вертикально, сохраняя корпус устойчивым.", "Поднимайтесь за счёт передней ноги, не отталкиваясь сильно задней."]	["Приседания — можно выполнять перед болгарскими выпадами.", "Жим ногами — добавит объём без сильной нагрузки на баланс.", "Хип-траст — хорошо дополнит ягодицы после выпадов."]	["Начинайте без веса, чтобы подобрать расстояние до скамьи.", "Не заваливайте колено внутрь.", "Держите движение медленным — упражнение сильно нагружает одну ногу."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
28	41	["Сядьте в тренажёр и настройте валик чуть выше стоп.", "Плотно прижмите спину к сиденью и возьмитесь за рукояти.", "Разгибайте ноги до почти прямого положения, сокращая квадрицепсы.", "Опускайте вес медленно, не бросая плиту."]	["Жим ногами — можно выполнить перед разгибаниями.", "Приседания — базовое движение, которое хорошо дополняется изоляцией.", "Гакк-приседания — подойдут для дополнительной нагрузки на квадрицепс."]	["Не используйте рывок в начале движения.", "Не блокируйте колени резко в верхней точке.", "Подбирайте вес так, чтобы контролировать опускание."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
29	42	["Настройте тренажёр так, чтобы валик находился у нижней части голени.", "Зафиксируйте корпус и держите таз прижатым к сиденью или скамье.", "Сгибайте ноги, подтягивая валик к себе за счёт задней поверхности бедра.", "Возвращайте вес медленно, не выпрямляя колени резко."]	["Румынская тяга — хорошо сочетается как базовое движение на заднюю поверхность бедра.", "Становая тяга на прямых ногах — похожий акцент с большим растяжением.", "Ягодичный мост — дополнит заднюю цепь."]	["Не отрывайте таз от опоры.", "Не бросайте вес на возврате.", "Делайте паузу в точке сокращения, если хотите лучше почувствовать бицепс бедра."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
30	43	["Встаньте в тренажёр или на платформу, расположив носки устойчиво.", "Опустите пятки вниз до комфортного растяжения.", "Поднимайтесь на носки максимально высоко, сохраняя колени почти прямыми.", "Опускайтесь медленно и контролируйте нижнюю фазу."]	["Подъём на носки сидя — дополнит работу камбаловидной мышцы.", "Жим ногами — можно выполнить перед икроножными.", "Ходьба — лёгкое кардио после тренировки ног."]	["Не пружиньте внизу.", "Делайте короткую паузу сверху.", "Следите, чтобы стопы не заваливались внутрь или наружу."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
31	44	["Сядьте в тренажёр и расположите валики на бёдрах.", "Поставьте носки на платформу, пятки оставьте свободными.", "Поднимайте пятки вверх, сокращая икры.", "Опускайте пятки вниз подконтрольно до растяжения."]	["Подъём на носки стоя — хорошо дополняет сидячий вариант.", "Жим ногами — можно поставить перед работой на икры.", "Велотренажёр — подойдёт для лёгкого завершения."]	["Не делайте движение коротким и быстрым.", "Сидячий вариант особенно нагружает камбаловидную мышцу.", "Используйте умеренный вес и полную амплитуду."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
32	45	["Поставьте стопы устойчиво и возьмите штангу на уровне верхней части груди.", "Напрягите пресс и ягодицы, чтобы корпус не прогибался назад.", "Выжимайте штангу вверх по вертикальной траектории.", "Опускайте гриф обратно к верхней части груди подконтрольно."]	["Жим гантелей сидя — похожее движение с большей свободой рук.", "Махи гантелями в стороны — добавят акцент на среднюю дельту.", "Разгибание рук на блоке — можно добавить для трицепса после жимов."]	["Не превращайте жим в сильный прогиб поясницы.", "Не запрокидывайте голову назад чрезмерно.", "Начинайте с веса, который не нарушает вертикальную траекторию."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
33	46	["Сядьте на скамью с опорой спины и поднимите гантели к плечам.", "Держите корпус стабильным, а стопы плотно на полу.", "Выжимайте гантели вверх, не сталкивая их над головой.", "Опускайте гантели до уровня плеч подконтрольно."]	["Армейский жим — можно использовать как более силовой вариант.", "Махи гантелями в стороны — хорошо дополняют жим для средней дельты.", "Обратная бабочка — поможет сбалансировать заднюю дельту."]	["Не выгибайте поясницу ради последних повторений.", "Не опускайте гантели слишком низко, если плечи теряют комфорт.", "Следите за симметрией движения рук."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
34	47	["Встаньте прямо и возьмите гантели по бокам корпуса.", "Слегка согните локти и зафиксируйте этот угол.", "Поднимайте гантели в стороны до уровня плеч или чуть ниже.", "Опускайте гантели медленно, не бросая их вниз."]	["Жим гантелей сидя — можно поставить перед махами.", "Тяга к подбородку — также нагружает среднюю дельту и трапеции.", "Разведения в наклоне — дополнит заднюю часть плеч."]	["Не поднимайте плечи к ушам.", "Не раскачивайте корпус.", "Лучше взять меньший вес и почувствовать среднюю дельту."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
35	48	["Встаньте прямо, гантели держите перед бёдрами.", "Слегка согните локти и напрягите корпус.", "Поднимайте гантели перед собой до уровня плеч.", "Опускайте вес плавно, не ударяя гантелями по ногам."]	["Армейский жим — можно выполнить перед подъёмами.", "Махи гантелями в стороны — добавят среднюю дельту.", "Жим Арнольда — сочетает работу передней и средней дельты."]	["Не используйте рывок поясницей.", "Не поднимайте гантели слишком высоко.", "Если передняя дельта уже устала после жимов, уменьшите объём."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
36	49	["Возьмите гантели и наклоните корпус вперёд с ровной спиной.", "Слегка согните локти и держите шею нейтрально.", "Разводите гантели в стороны, направляя локти назад и вверх.", "Опускайте гантели медленно, сохраняя контроль задней дельты."]	["Тяга каната к лицу — хорошо дополняет заднюю дельту.", "Обратная бабочка — похожая альтернатива в тренажёре.", "Тяга верхнего блока — можно сочетать в день спины."]	["Не превращайте движение в тягу к поясу.", "Не округляйте спину.", "Используйте небольшой вес — задняя дельта лучше реагирует на контроль."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
37	50	["Возьмите штангу хватом примерно на ширине плеч.", "Встаньте прямо, напрягите корпус и держите гриф перед бёдрами.", "Тяните штангу вверх к нижней части груди, ведя локти вверх.", "Опускайте штангу медленно, не бросая её вниз."]	["Махи гантелями в стороны — дополнят среднюю дельту.", "Шраги с гантелями — добавят акцент на трапеции.", "Жим гантелей сидя — можно выполнить перед тягой."]	["Не тяните гриф слишком высоко, если плечам некомфортно.", "Не используйте чрезмерно узкий хват.", "Движение должно быть контролируемым, без рывка корпусом."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
38	51	["Возьмите штангу хватом снизу примерно на ширине плеч.", "Встаньте ровно, прижмите локти ближе к корпусу.", "Сгибайте руки, поднимая штангу за счёт бицепса.", "Опускайте штангу медленно до почти полного выпрямления рук."]	["Тяга верхнего блока — можно выполнить перед сгибаниями в день спины и бицепса.", "Молотковые сгибания — дополнят нагрузку на плечевую мышцу и предплечья.", "Сгибание рук на скамье Скотта — подойдёт для изоляции."]	["Не раскачивайте корпус.", "Не выводите локти сильно вперёд.", "Контролируйте негативную фазу — она важна для бицепса."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
39	52	["Возьмите гантели и встаньте ровно или сядьте на скамью.", "Держите локти рядом с корпусом и не раскачивайтесь.", "Сгибайте руки, разворачивая ладони вверх по ходу движения.", "Опускайте гантели подконтрольно до исходного положения."]	["Сгибание рук со штангой — можно использовать как базовое движение.", "Молотковые сгибания — добавят акцент на предплечья.", "Концентрированные сгибания — хорошо подходят для завершения бицепса."]	["Не поднимайте плечи при сгибании.", "Не бросайте гантели вниз.", "Можно выполнять поочерёдно, чтобы лучше контролировать каждую руку."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
40	53	["Возьмите гантели нейтральным хватом, ладони смотрят друг на друга.", "Держите локти ближе к корпусу и стабилизируйте плечи.", "Сгибайте руки без разворота кистей, сохраняя молотковый хват.", "Опускайте гантели медленно, контролируя предплечья."]	["Сгибание рук с гантелями — дополнит обычную супинацию.", "Подъём штанги на бицепс — можно поставить перед молотками.", "Концентрированные сгибания — подойдут как финальное изолирующее движение."]	["Не раскачивайтесь корпусом.", "Держите кисти нейтрально, не заламывайте их.", "Это упражнение хорошо подходит после основных сгибаний."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
41	54	["Сядьте за скамью Скотта и расположите плечи на опоре.", "Возьмите гриф или гантель так, чтобы локти были устойчиво зафиксированы.", "Сгибайте руки, поднимая вес без отрыва плеч от скамьи.", "Опускайте вес медленно, не расслабляя бицепс в нижней точке."]	["Сгибание рук со штангой — можно выполнить перед скамьёй Скотта.", "Молотковые сгибания — дополнят нагрузку на предплечья.", "Концентрированные сгибания — похожее изолирующее завершение."]	["Не выпрямляйте локти резко до болезненного растяжения.", "Не отрывайте плечи от опоры.", "Используйте умеренный вес, чтобы не перегружать локти."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
42	55	["Лягте на скамью и возьмите штангу узким или средним хватом.", "Поднимите гриф над собой и зафиксируйте плечи.", "Сгибайте локти, опуская штангу ко лбу или чуть за голову.", "Разгибайте руки за счёт трицепса, не разводя локти широко."]	["Жим узким хватом — можно выполнить перед французским жимом.", "Разгибание рук на блоке — хорошо подходит после него.", "Отжимания узким хватом — альтернатива с собственным весом."]	["Не разводите локти в стороны.", "Не берите слишком большой вес — упражнение нагружает локти.", "Опускайте гриф подконтрольно, без резких движений."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
43	56	["Встаньте у верхнего блока и возьмите рукоять или канат.", "Прижмите локти ближе к корпусу и слегка наклонитесь вперёд.", "Разгибайте руки вниз до полного сокращения трицепса.", "Возвращайте рукоять вверх медленно, не уводя локти вперёд."]	["Жим узким хватом — можно выполнить перед блоком как базовое движение.", "Французский жим — дополнит длинную головку трицепса.", "Отжимания узким хватом — хорошая альтернатива без тренажёра."]	["Не раскачивайте корпус.", "Не отрывайте локти от корпуса.", "Внизу можно слегка развести концы каната для лучшего сокращения."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
44	57	["Лягте на скамью и возьмите штангу хватом уже обычного жима.", "Сведите лопатки, поставьте стопы на пол и снимите гриф.", "Опускайте штангу к нижней части груди, держа локти ближе к корпусу.", "Выжимайте вверх за счёт груди и трицепса без отбива от груди."]	["Разгибание рук на блоке — можно поставить после жима для изоляции.", "Французский жим — дополнит длинную головку трицепса.", "Отжимания узким хватом — похожее движение с собственным весом."]	["Не делайте хват слишком узким, чтобы не перегружать запястья.", "Не разводите локти широко.", "Используйте страховку при тяжёлом весе."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
45	58	["Возьмите гантель одной рукой и поднимите её над головой.", "Зафиксируйте плечо, локоть направьте вверх.", "Опускайте гантель за голову, сгибая только локоть.", "Разгибайте руку вверх, сокращая трицепс."]	["Французский жим — похожее движение двумя руками или со штангой.", "Разгибание рук на блоке — хорошо дополнит упражнение.", "Жим узким хватом — можно выполнить перед изоляцией."]	["Не разворачивайте локоть в сторону.", "Не прогибайтесь в пояснице.", "Выбирайте вес, который позволяет контролировать нижнюю точку."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
46	61	["Лягте на коврик и вытяните ноги.", "Прижмите поясницу к полу и напрягите пресс.", "Поднимайте ноги вверх до комфортного угла.", "Опускайте ноги медленно, не отрывая поясницу от пола."]	["Скручивания — добавят нагрузку на верхнюю часть пресса.", "Планка — поможет закрепить стабильность корпуса.", "Обратные скручивания — похожее движение с большим акцентом на таз."]	["Не опускайте ноги слишком низко, если поясница выгибается.", "Не используйте мах ногами.", "Для упрощения держите колени слегка согнутыми."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
47	62	["Повисните на турнике и зафиксируйте плечи, не раскачиваясь.", "Напрягите пресс и поднимайте колени или прямые ноги вверх.", "В верхней точке слегка подкрутите таз, чтобы включить нижнюю часть пресса.", "Опускайте ноги медленно, избегая раскачки."]	["Вис на турнике — поможет укрепить хват для этого упражнения.", "Скручивания — дополнят верхнюю часть пресса.", "Планка — хорошо завершает блок корпуса."]	["Не раскачивайтесь для инерции.", "Если прямые ноги слишком сложно, начинайте с подъёма коленей.", "Держите плечи стабильными, не проваливайтесь в висе."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
48	65	["Лягте на спину, согните ноги и поставьте стопы на пол.", "Расположите стопы так, чтобы в верхней точке голени были близки к вертикали.", "Поднимайте таз вверх, сжимая ягодицы.", "Опускайтесь вниз подконтрольно, не расслабляясь полностью между повторениями."]	["Хип-траст — более силовой вариант с большей амплитудой.", "Отведение ноги назад — добавит изоляцию ягодиц.", "Приседания — можно сочетать как базовое движение."]	["Не прогибайтесь чрезмерно в пояснице.", "В верхней точке делайте короткую паузу.", "Не ставьте стопы слишком далеко, иначе нагрузка уйдёт в заднюю поверхность бедра."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
49	66	["Сядьте на пол спиной к скамье и расположите штангу над тазом.", "Поставьте стопы на ширине таза и зафиксируйте верх спины на скамье.", "Поднимайте таз вверх, пока корпус и бёдра не образуют прямую линию.", "Опускайтесь вниз подконтрольно, сохраняя напряжение в ягодицах."]	["Ягодичный мост — можно использовать как более простой вариант.", "Румынская тяга — хорошо дополняет ягодицы и заднюю поверхность бедра.", "Отведение ноги назад — подойдёт для изоляции после хип-траста."]	["Не переразгибайте поясницу в верхней точке.", "Подбородок держите слегка опущенным.", "Используйте мягкую накладку на гриф для комфорта."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
50	67	["Настройте тренажёр и зафиксируйте корпус.", "Поставьте рабочую ногу на платформу или упор.", "Отводите ногу назад за счёт ягодицы, не разворачивая таз.", "Возвращайте ногу медленно, сохраняя контроль."]	["Хип-траст — можно выполнить перед отведением как базовое упражнение.", "Ягодичный мост — хорошо сочетается для дополнительного объёма.", "Болгарские выпады — добавят нагрузку на ягодицы и ноги."]	["Не прогибайтесь в пояснице ради амплитуды.", "Держите таз ровно.", "Работайте в контролируемом темпе, без махов."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
51	68	["Сядьте или встаньте в тренажёр для отведения ноги в сторону.", "Зафиксируйте корпус и держите таз ровно.", "Отводите ногу в сторону до комфортной амплитуды.", "Возвращайте ногу медленно, не бросая вес."]	["Болгарские выпады — хорошо сочетаются для средней ягодичной мышцы.", "Хип-траст — можно выполнить перед изоляцией.", "Ягодичный мост — подойдёт как дополнительное упражнение."]	["Не заваливайте корпус в сторону.", "Не используйте рывок.", "В верхней точке делайте короткую паузу для лучшего ощущения ягодиц."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
52	69	["Начните с лёгкой разминки и постепенно увеличьте темп.", "Держите корпус ровно, смотрите вперёд и не зажимайте плечи.", "Приземляйтесь мягко, сохраняя естественную работу стопы.", "Завершайте бег постепенным снижением темпа, а не резкой остановкой."]	["Ходьба — подойдёт для разминки или заминки.", "Планка — поможет укрепить корпус для бега.", "Растяжка ног — хорошее завершение кардио."]	["Не начинайте сразу с максимальной скорости.", "Следите за дыханием и пульсом.", "Подбирайте обувь и поверхность так, чтобы снизить ударную нагрузку."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
53	70	["Отрегулируйте высоту сиденья так, чтобы колено оставалось слегка согнутым в нижней точке.", "Начните с лёгкого сопротивления и ровного темпа.", "Крутите педали плавно, не раскачивая корпус.", "Постепенно снижайте нагрузку в конце тренировки."]	["Жим ногами — можно сочетать с велотренажёром после силовой части.", "Подъём на носки — хорошо дополняет тренировку ног.", "Ходьба — подойдёт как лёгкая заминка."]	["Не ставьте слишком высокое сопротивление без разминки.", "Держите колени по линии стоп.", "Следите, чтобы спина не сутулилась."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
54	71	["Встаньте на платформы и возьмитесь за рукояти.", "Начните движение плавно, распределяя нагрузку между ногами и руками.", "Держите корпус ровно и не переносите весь вес на рукояти.", "Поддерживайте стабильный ритм до конца подхода или интервала."]	["Велотренажёр — альтернатива для кардио с меньшей работой рук.", "Планка — поможет укрепить корпус.", "Растяжка икр и бёдер — хорошее завершение."]	["Не сутультесь во время движения.", "Не ставьте сопротивление слишком высоким сразу.", "Следите за равномерным дыханием."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
55	72	["Возьмите скакалку за рукояти и держите локти ближе к корпусу.", "Вращайте скакалку в основном кистями, а не всей рукой.", "Прыгайте невысоко, мягко приземляясь на переднюю часть стопы.", "Сохраняйте ровный ритм и короткие интервалы, если вы новичок."]	["Бег — можно чередовать со скакалкой в кардио-день.", "Планка — укрепит корпус для стабильных прыжков.", "Подъём на носки — дополнит работу икр."]	["Не прыгайте слишком высоко.", "Не приземляйтесь жёстко на пятки.", "Начинайте с коротких подходов, чтобы не перегружать голени."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
56	73	["Сядьте на тренажёр, закрепите стопы и возьмитесь за рукоять.", "Начинайте движение ногами, затем подключайте корпус и руки.", "Тяните рукоять к нижней части груди или верхней части живота.", "На возврате сначала выпрямляйте руки, затем корпус и только потом сгибайте ноги."]	["Тяга верхнего блока — хорошо сочетается с греблей для спины.", "Планка — поможет укрепить корпус.", "Велотренажёр — можно чередовать в кардио-тренировках."]	["Не начинайте тягу только руками.", "Не округляйте спину в передней точке.", "Держите ритм плавным: ноги, корпус, руки."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
57	74	["Возьмите гантели и наклоните корпус вперёд с ровной спиной.", "Слегка согните локти и удерживайте гантели под плечами.", "Разводите руки в стороны, направляя локти наружу и назад.", "Опускайте гантели подконтрольно, не расслабляя плечи полностью."]	["Тяга каната к лицу — отлично дополняет заднюю дельту.", "Обратная бабочка — похожее движение в тренажёре.", "Горизонтальная тяга — можно сочетать в день спины."]	["Не берите большой вес.", "Не тяните гантели к поясу — это уже другое движение.", "Держите шею нейтрально и не сутультесь."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
58	75	["Сядьте в тренажёр лицом к спинке и возьмитесь за рукояти.", "Слегка согните локти и держите грудь прижатой к опоре.", "Разводите руки назад, концентрируясь на задней дельте.", "Возвращайте рукояти медленно, не бросая вес."]	["Разведения гантелей в наклоне — свободная альтернатива.", "Тяга каната к лицу — хорошо дополняет заднюю дельту и верх спины.", "Тяга к подбородку — можно использовать для плечевого дня."]	["Не сводите лопатки слишком сильно вместо работы плеч.", "Не поднимайте плечи к ушам.", "Используйте умеренный вес и чистую траекторию."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
59	76	["Установите канат на верхнем блоке и возьмитесь за концы.", "Отойдите назад, чтобы трос был натянут, и держите корпус ровно.", "Тяните канат к лицу, разводя концы в стороны.", "Возвращайте руки вперёд медленно, сохраняя контроль плеч."]	["Обратная бабочка — хорошо дополняет заднюю дельту.", "Разведения гантелей в наклоне — альтернатива со свободным весом.", "Горизонтальная тяга — можно сочетать в день спины."]	["Не тяните канат к шее слишком низко.", "Не прогибайтесь в пояснице.", "Держите локти высоко и контролируйте лопатки."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
60	77	["Встаньте между блоками и возьмите противоположные рукояти.", "Слегка наклонитесь вперёд и зафиксируйте корпус.", "Разводите руки назад и в стороны, сохраняя небольшой сгиб в локтях.", "Возвращайте рукояти плавно, не позволяя грузу тянуть плечи вперёд."]	["Тяга каната к лицу — отлично дополняет заднюю дельту.", "Обратная бабочка — более стабильный вариант в тренажёре.", "Разведения гантелей в наклоне — альтернатива с гантелями."]	["Не используйте слишком большой вес.", "Не поднимайте плечи к ушам.", "Держите движение широким, а не тяните рукояти к корпусу."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
61	78	["Примите упор лёжа, поставив ладони уже ширины плеч.", "Держите корпус прямым и напрягите пресс.", "Опускайтесь вниз, ведя локти ближе к корпусу.", "Отжимайтесь вверх, акцентируя работу трицепса."]	["Жим узким хватом — силовая альтернатива со штангой.", "Разгибание рук на блоке — хорошая изоляция после отжиманий.", "Французский жим — дополнит длинную головку трицепса."]	["Не ставьте ладони слишком близко, если запястьям некомфортно.", "Не разводите локти в стороны.", "Для упрощения выполняйте отжимания от возвышения."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
62	79	["Лягте на спину, согните колени и поднимите ноги.", "Прижмите поясницу к полу и напрягите пресс.", "Подкручивайте таз вверх, подтягивая колени к груди.", "Опускайте таз обратно медленно, не бросая ноги."]	["Подъём ног лёжа — похожее движение для нижней части пресса.", "Скручивания — дополнят верх пресса.", "Боковая планка — добавит косые мышцы."]	["Не раскачивайте ноги.", "Движение должно идти за счёт подкручивания таза.", "Не давите руками в пол слишком сильно."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
63	80	["Возьмитесь за турник удобным хватом и аккуратно повисните.", "Опустите плечи от ушей и держите корпус в стабильном положении.", "Сохраняйте ровное дыхание и не раскачивайтесь.", "Завершайте подход аккуратно, не спрыгивая резко с большой высоты."]	["Подтягивания — логично выполнять после развития хвата.", "Подъём ног в висе — можно сочетать, если хватает силы хвата.", "Тяга верхнего блока — альтернатива для спины без длительного виса."]	["Не висите через боль в плечах.", "Начинайте с коротких подходов.", "Можно использовать магнезию или лямки, если цель — спина, а не хват."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
64	81	["Встаньте в тренажёр или у Т-грифа и займите устойчивое положение.", "Возьмитесь за рукояти, держите спину ровной и корпус слегка наклонённым.", "Тяните вес к корпусу, сводя лопатки в конце движения.", "Опускайте вес подконтрольно до растяжения спины."]	["Горизонтальная тяга — похожее движение в тренажёре.", "Тяга верхнего блока — дополнит вертикальной тягой.", "Разведения гантелей в наклоне — добавят заднюю дельту."]	["Не округляйте спину.", "Не дёргайте вес корпусом.", "В верхней точке не поднимайте плечи к ушам."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
65	82	["Возьмите штангу хватом снизу и встаньте ровно.", "Зафиксируйте локти рядом с корпусом.", "Поднимайте штангу за счёт сгибания рук, не раскачивая корпус.", "Опускайте гриф медленно, сохраняя контроль бицепса."]	["Сгибание рук с гантелями — добавит независимую работу рук.", "Молотковые сгибания — дополнят предплечья и плечевую мышцу.", "Скамья Скотта — подойдёт для изоляции после базового подъёма."]	["Не выводите локти далеко вперёд.", "Не помогайте себе спиной.", "Следите, чтобы запястья оставались нейтральными."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
66	83	["Расположите штангу на передней части плеч, удерживая локти высоко.", "Поставьте стопы устойчиво и напрягите корпус.", "Опускайтесь вниз, сохраняя корпус более вертикальным, чем в обычном приседе.", "Поднимайтесь вверх через середину стопы, не опуская локти."]	["Гакк-приседания — хорошо дополняют акцент на квадрицепс.", "Разгибание ног — можно поставить после фронтальных приседаний.", "Подъём на носки стоя — завершит тренировку ног."]	["Не опускайте локти вниз — штанга начнёт скатываться.", "Не округляйте верх спины.", "Используйте меньший вес, чем в обычных приседаниях, пока техника не стабильна."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
67	84	["Лягте верхней частью спины на скамью и возьмите гантель двумя руками.", "Поднимите гантель над грудью, слегка согнув локти.", "Опускайте гантель за голову до комфортного растяжения.", "Возвращайте гантель над грудью, контролируя плечи и рёбра."]	["Жим гантелей лёжа — можно выполнить перед пуловером для груди.", "Тяга верхнего блока — хорошо сочетается, если акцент на широчайшие.", "Кроссовер — можно добавить после пуловера для груди."]	["Не прогибайте поясницу чрезмерно.", "Не опускайте гантель слишком глубоко при дискомфорте в плечах.", "Держите локти слегка согнутыми на протяжении движения."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
68	85	["Возьмите штангу и поставьте стопы на ширине таза.", "Слегка согните колени и держите спину ровной.", "Отводите таз назад, опуская штангу вдоль ног.", "Поднимайтесь вверх за счёт ягодиц и задней поверхности бедра."]	["Сгибание ног — дополнит изоляцией бицепса бедра.", "Хип-траст — добавит акцент на ягодицы.", "Гиперэкстензия — можно использовать как вспомогательное движение."]	["Не округляйте спину.", "Не превращайте движение в присед.", "Опускайтесь только до уровня, где сохраняется натяжение и ровная спина."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
69	86	["Начинайте плавно, выбрав комфортный стиль плавания.", "Держите дыхание ритмичным и не задерживайте его надолго.", "Старайтесь сохранять вытянутое положение тела в воде.", "Завершайте тренировку спокойным темпом, снижая интенсивность."]	["Ходьба — подойдёт как лёгкая активность в день восстановления.", "Планка — укрепит корпус для стабильного положения в воде.", "Растяжка плеч и спины — хорошее дополнение после плавания."]	["Не начинайте с максимальной скорости.", "Следите за техникой дыхания.", "Если устают плечи, снизьте объём и темп."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
70	87	["Лягте на коврик, согните ноги и заведите руки за голову без давления на шею.", "Поднимайте корпус с поворотом к противоположному колену.", "Сохраняйте поясницу стабильной и не тяните голову руками.", "Возвращайтесь вниз медленно и повторяйте на другую сторону."]	["Русские повороты — хорошо дополняют косые мышцы.", "Боковая планка — добавит статическую нагрузку на бок корпуса.", "Скручивания — можно выполнить перед косыми скручиваниями."]	["Не делайте резких поворотов корпусом.", "Не тяните шею руками.", "Лучше выполнять медленно и контролируемо."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
71	88	["Возьмите гантели и встаньте прямо, руки опущены по бокам.", "Держите корпус ровно и смотрите вперёд.", "Поднимайте плечи вверх к ушам, сокращая трапеции.", "Опускайте плечи вниз медленно, не вращая ими."]	["Тяга к подбородку — также нагружает трапеции и плечи.", "Тяга каната к лицу — хорошо дополняет верх спины.", "Разведения в наклоне — добавят заднюю дельту."]	["Не вращайте плечами по кругу.", "Не сгибайте руки в локтях.", "Делайте паузу в верхней точке, но не зажимайте шею."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
72	89	["Лягте на бок и поставьте локоть под плечо.", "Выпрямите тело в одну линию и поднимите таз от пола.", "Напрягите пресс и ягодицы, удерживая корпус стабильным.", "Держите заданное время, затем повторите на другую сторону."]	["Планка — базовое статическое упражнение для корпуса.", "Русские повороты — добавят динамику для косых мышц.", "Косые скручивания — можно использовать как более простой вариант."]	["Не проваливайте таз вниз.", "Не разворачивайте корпус вперёд или назад.", "Начинайте с коротких подходов на каждую сторону."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
73	90	["Сядьте в тренажёр и настройте сиденье так, чтобы рукояти были на уровне груди.", "Прижмите спину к опоре и возьмитесь за рукояти.", "Сводите руки перед собой, сокращая грудные мышцы.", "Возвращайте рукояти назад медленно до комфортного растяжения."]	["Жим лёжа — можно выполнить перед сведением как базовое движение.", "Кроссовер — похожая альтернатива на блоках.", "Разводка гантелей — свободный вариант изолирующего движения."]	["Не бросайте вес на обратной фазе.", "Не сводите плечи вперёд чрезмерно.", "В точке сокращения можно сделать короткую паузу."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
74	91	["Встаньте на дорожку и начните с медленной ходьбы.", "Постепенно увеличьте скорость или наклон до нужной интенсивности.", "Держите корпус ровно и не держитесь за поручни без необходимости.", "Завершайте тренировку снижением скорости до спокойной ходьбы."]	["Ходьба — лёгкий вариант для разминки и восстановления.", "Бег — можно выполнять на улице или дорожке.", "Планка — поможет укрепить корпус для стабильного бега."]	["Не начинайте сразу с высокой скорости.", "Следите за положением стоп и дыханием.", "Используйте наклон умеренно, чтобы не перегружать голени."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
75	92	["Настройте скамью под умеренный наклон и лягте так, чтобы гриф был над верхней частью груди.", "Сведите лопатки и поставьте стопы на пол.", "Опускайте штангу к верхней части груди подконтрольно.", "Выжимайте гриф вверх, сохраняя траекторию и стабильные плечи."]	["Жим гантелей на наклонной скамье — добавит амплитуду и работу стабилизаторов.", "Кроссовер — можно выполнить после жима для изоляции.", "Сведение рук в тренажёре — подойдёт для завершения груди."]	["Не ставьте слишком большой наклон, чтобы нагрузка не ушла в плечи.", "Не отбивайте штангу от груди.", "Используйте страховку при тяжёлом весе."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
76	93	["Начните с комфортного темпа и ровного дыхания.", "Держите корпус прямо, плечи расслаблены, взгляд направлен вперёд.", "Ставьте стопу мягко и сохраняйте естественный шаг.", "При необходимости постепенно увеличивайте скорость или наклон."]	["Беговая дорожка — удобный вариант ходьбы с контролем скорости.", "Велотренажёр — альтернатива для лёгкого кардио.", "Растяжка ног — хорошее завершение после ходьбы."]	["Не сутультесь и не смотрите постоянно вниз.", "Для восстановления держите низкую интенсивность.", "Ходьба хорошо подходит как разминка перед силовой тренировкой."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
77	94	["Сядьте в гакк-тренажёр и плотно прижмите спину к опоре.", "Поставьте стопы на платформу на комфортной ширине.", "Опускайтесь вниз, контролируя колени и положение таза.", "Поднимайтесь вверх через всю стопу, не блокируя колени резко."]	["Фронтальные приседания — хорошо сочетаются с акцентом на квадрицепс.", "Разгибание ног — можно добавить после гакк-приседаний.", "Подъём на носки стоя — завершит тренировку ног."]	["Не отрывайте таз и спину от опоры.", "Не сводите колени внутрь.", "Подберите постановку стоп так, чтобы движение было комфортным для коленей."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
78	95	["Сядьте на скамью и поднимите гантели перед плечами ладонями к себе.", "Начинайте жим, одновременно разворачивая кисти наружу.", "В верхней точке гантели находятся над плечами, корпус остаётся стабильным.", "Опускайте гантели обратно с обратным разворотом кистей."]	["Жим гантелей сидя — более простой вариант без разворота.", "Махи гантелями в стороны — добавят среднюю дельту.", "Разведения в наклоне — помогут сбалансировать заднюю дельту."]	["Не делайте движение рывком.", "Не прогибайтесь в пояснице.", "Если плечам некомфортен разворот, замените упражнение обычным жимом гантелей."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
79	96	["Сядьте на скамью, возьмите гантель и уприте локоть во внутреннюю часть бедра.", "Опустите руку вниз, сохраняя плечо неподвижным.", "Сгибайте руку, поднимая гантель за счёт бицепса.", "Опускайте гантель медленно почти до полного выпрямления."]	["Сгибание рук с гантелями — можно выполнить перед концентрированными сгибаниями.", "Скамья Скотта — похожее изолирующее движение.", "Молотковые сгибания — добавят работу предплечья."]	["Не раскачивайте корпус.", "Не отрывайте локоть от бедра.", "Делайте движение медленно, особенно на опускании."]	2026-05-20 21:25:02.491572	2026-05-20 21:25:02.491572
\.


--
-- TOC entry 5289 (class 0 OID 57571)
-- Dependencies: 227
-- Data for Name: exercise_muscle_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercise_muscle_groups (exercise_id, muscle_group_id, is_primary) FROM stdin;
1	1	t
2	1	t
3	1	t
4	1	t
5	1	t
6	2	t
7	2	t
8	2	t
9	2	t
10	2	t
11	3	t
12	3	t
13	3	t
14	3	t
15	3	t
16	7	t
17	7	t
18	7	t
19	7	t
20	7	t
28	1	t
25	1	t
34	2	t
31	2	t
30	2	t
42	3	t
41	3	t
39	3	t
36	3	t
54	4	t
53	4	t
52	4	t
51	4	t
58	5	t
57	5	t
56	5	t
55	5	t
50	6	t
49	6	t
48	6	t
47	6	t
46	6	t
45	6	t
62	7	t
61	7	t
44	9	t
43	9	t
68	10	t
67	10	t
66	10	t
65	10	t
73	11	t
72	11	t
71	11	t
70	11	t
69	11	t
77	8	t
75	8	t
76	8	t
74	8	t
\.


--
-- TOC entry 5288 (class 0 OID 57553)
-- Dependencies: 226
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, name, description, difficulty, equipment, is_premium, created_at, name_ru, description_ru, source, source_id, external_category, external_muscles, external_equipment, measure_type, measure_units, group_id) FROM stdin;
2	Тяга верхнего блока	Упражнение для широчайших мышц спины	Средняя	Тренажёр	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
3	Тяга штанги в наклоне	Базовое упражнение для спины	Высокая	Штанга	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
4	Горизонтальная тяга	Упражнение для средней части спины	Средняя	Тренажёр	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
5	Гиперэкстензия	Упражнение для разгибателей спины	Низкая	Тренажёр	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
6	Жим лёжа	Базовое упражнение для грудных мышц	Средняя	Штанга	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
7	Жим гантелей	Упражнение для грудных мышц	Средняя	Гантели	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
8	Разводка гантелей	Изолирующее упражнение для грудных мышц	Средняя	Гантели	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
9	Отжимания на брусьях	Упражнение для груди и трицепса	Высокая	Брусья	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
10	Кроссовер	Изолирующее упражнение для груди	Средняя	Кроссовер	t	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
11	Приседания со штангой	Базовое упражнение для ног	Высокая	Штанга	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
12	Жим ногами	Упражнение для мышц ног	Средняя	Тренажёр	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
13	Выпады	Упражнение для ног и ягодиц	Средняя	Гантели	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
14	Румынская тяга	Упражнение для задней поверхности бедра	Высокая	Штанга	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
15	Подъём на носки	Упражнение для икроножных мышц	Низкая	Тренажёр	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
16	Скручивания	Упражнение для мышц пресса	Низкая	Без оборудования	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
67	Отведение ноги назад	Упражнение для ягодиц	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
68	Отведение ноги в сторону	Упражнение для средней ягодичной мышцы	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
70	Велотренажёр	Кардиоупражнение	Низкая	Велотренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
71	Эллиптический тренажёр	Кардиоупражнение	Низкая	Эллипс	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
72	Скакалка	Кардиоупражнение	Средняя	Скакалка	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
73	Гребной тренажёр	Кардиоупражнение	Средняя	Гребной тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
74	Разведения гантелей в наклоне	Изолирующее упражнение для задней дельты	Низкая	Гантели	f	2026-05-12 21:10:03.441884	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
1	Подтягивания	Базовое упражнение для развития мышц спины и рук	Высокая	Турник	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg", "reps"]	\N
75	Обратная бабочка	Упражнение в тренажёре для задней дельты	Низкая	Тренажёр	f	2026-05-12 21:10:03.441884	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
17	Планка	Статическое упражнение для корпуса	Средняя	Без оборудования	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	time_sets	["min"]	\N
18	Подъём ног	Упражнение для нижней части пресса	Средняя	Без оборудования	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
19	Велосипед	Динамическое упражнение для пресса	Средняя	Без оборудования	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
20	Русские повороты	Упражнение для косых мышц живота	Средняя	Без оборудования	t	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
28	Становая тяга	Базовое упражнение для спины, ног и ягодиц	Высокая	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
90	Сведение рук в тренажёре	Изолирующее упражнение для грудных мышц	Низкая	Тренажёр	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
92	Жим штанги на наклонной скамье	Упражнение для верхней части грудных мышц	Средняя	Штанга	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
80	Вис на турнике	Статическое упражнение для хвата, спины и плечевого пояса	Средняя	Турник	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	time_sets	["min"]	\N
89	Боковая планка	Статическое упражнение для косых мышц живота и корпуса	Средняя	Коврик	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	time_sets	["min"]	\N
81	Тяга Т-грифа	Упражнение для мышц спины с акцентом на середину спины	Средняя	Тренажёр	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
84	Пуловер с гантелью	Упражнение для грудных мышц и широчайших мышц спины	Средняя	Гантель	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
78	Отжимания узким хватом	Упражнение с собственным весом для трицепса	Средняя	Собственный вес	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
31	Жим гантелей на наклонной скамье	Упражнение для верхней части груди	Средняя	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
34	Отжимания	Упражнение с собственным весом для груди и трицепса	Низкая	Собственный вес	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
36	Приседания	Базовое упражнение для ног и ягодиц	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
39	Болгарские выпады	Одностороннее упражнение для ног и ягодиц	Средняя	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
41	Разгибание ног	Изолирующее упражнение для квадрицепсов	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
42	Сгибание ног	Изолирующее упражнение для задней поверхности бедра	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
45	Армейский жим	Базовое упражнение для плеч	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
69	Бег	Кардиоупражнение	Низкая	Без оборудования	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
43	Подъём на носки стоя	Упражнение для икроножных мышц	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
25	Тяга гантели в наклоне	Односторонняя тяга для мышц спины	Средняя	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
30	Жим гантелей лёжа	Упражнение для грудных мышц с гантелями	Средняя	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
56	Разгибание рук на блоке	Изолирующее упражнение для трицепса	Низкая	Блочный тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
58	Разгибание руки с гантелью из-за головы	Упражнение для трицепса	Низкая	Гантель	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
61	Подъём ног лёжа	Упражнение для нижней части пресса	Низкая	Коврик	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
65	Ягодичный мост	Упражнение для ягодичных мышц	Низкая	Коврик	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
86	Плавание	Кардиоупражнение для развития выносливости и работы всего тела	Средняя	Бассейн	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
91	Беговая дорожка	Кардиоупражнение на беговой дорожке	Средняя	Беговая дорожка	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
93	Ходьба	Кардиоупражнение для лёгкой активности и восстановления	Низкая	Без оборудования	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	distance_time	["km", "min"]	\N
83	Фронтальные приседания	Вариант приседаний со штангой с акцентом на квадрицепсы	Высокая	Штанга	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
85	Становая тяга на прямых ногах	Упражнение для задней поверхности бедра и ягодиц	Средняя	Штанга	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
94	Гакк-приседания	Упражнение для ног в тренажёре	Средняя	Тренажёр	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
76	Тяга каната к лицу	Упражнение для задней дельты и верхней части спины	Средняя	Блочный тренажёр	f	2026-05-12 21:10:03.441884	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
77	Разведения рук в кроссовере на заднюю дельту	Изолирующее упражнение для задней дельты на блоках	Средняя	Кроссовер	f	2026-05-12 21:10:03.441884	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
88	Шраги с гантелями	Упражнение для трапециевидных мышц	Средняя	Гантели	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
95	Жим Арнольда	Упражнение для дельтовидных мышц с гантелями	Средняя	Гантели	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
82	Подъём штанги на бицепс	Базовое упражнение для бицепса	Средняя	Штанга	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
79	Обратные скручивания	Упражнение для нижней части пресса	Низкая	Коврик	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
44	Подъём на носки сидя	Упражнение для камбаловидной мышцы	Низкая	Тренажёр	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
46	Жим гантелей сидя	Упражнение для дельтовидных мышц	Средняя	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
47	Махи гантелями в стороны	Изолирующее упражнение для средней дельты	Низкая	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
48	Махи гантелями перед собой	Упражнение для передней дельты	Низкая	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
49	Разведения в наклоне	Упражнение для задней дельты	Низкая	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
50	Тяга к подбородку	Упражнение для плеч и трапеций	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
51	Сгибание рук со штангой	Упражнение для бицепса	Низкая	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
52	Сгибание рук с гантелями	Упражнение для бицепса	Низкая	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
53	Молотковые сгибания	Упражнение для бицепса и предплечий	Низкая	Гантели	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
54	Сгибание рук на скамье Скотта	Изолирующее упражнение для бицепса	Низкая	Скамья Скотта	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
55	Французский жим	Упражнение для трицепса	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
57	Жим узким хватом	Базовое упражнение для трицепса	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
62	Подъём ног в висе	Упражнение для пресса	Средняя	Турник	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
66	Хип-траст	Упражнение для ягодичных мышц со штангой	Средняя	Штанга	f	2026-05-09 01:17:15.742828	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
96	Концентрированные сгибания	Изолирующее упражнение для бицепса	Низкая	Гантель	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
87	Косые скручивания	Упражнение для косых мышц живота	Низкая	Коврик	f	2026-05-19 09:08:10.529082	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
\.


--
-- TOC entry 5308 (class 0 OID 122884)
-- Dependencies: 246
-- Data for Name: friend_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friend_requests (id, sender_id, receiver_id, status, created_at, updated_at) FROM stdin;
5e66c066-418a-4d68-b5a4-0fbd8c2b72ee	39705cc8-35ea-427d-81e8-a7d11657cff0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	accepted	2026-05-23 17:20:13.924687	2026-05-23 17:20:32.078168
9e378080-5321-4edf-821e-b5478d33766e	0ce96fe6-1b90-4816-a93e-f388ba244b19	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	accepted	2026-05-23 17:21:37.376436	2026-05-23 17:21:44.222701
ec91cb6d-43de-421b-9f59-72fc1c87ddfa	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	0ce96fe6-1b90-4816-a93e-f388ba244b19	declined	2026-05-23 17:34:01.496743	2026-05-23 17:36:07.742739
f28ba595-df1e-45db-bb33-12de21b2a026	0ce96fe6-1b90-4816-a93e-f388ba244b19	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	declined	2026-05-23 17:36:18.068025	2026-05-23 17:38:53.435789
62b45e12-184f-4496-bef6-31a2b872b3df	0ce96fe6-1b90-4816-a93e-f388ba244b19	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	accepted	2026-05-25 22:52:13.394994	2026-05-25 22:52:20.686808
\.


--
-- TOC entry 5291 (class 0 OID 57591)
-- Dependencies: 229
-- Data for Name: muscle_group_combinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.muscle_group_combinations (id, main_muscle_group_id, recommended_muscle_group_id, description) FROM stdin;
1	1	4	Рекомендуемое сочетание для тренировки
2	1	7	Рекомендуемое сочетание для тренировки
3	1	8	Рекомендуемое сочетание для тренировки
4	2	5	Рекомендуемое сочетание для тренировки
5	2	6	Рекомендуемое сочетание для тренировки
6	2	7	Рекомендуемое сочетание для тренировки
7	3	7	Рекомендуемое сочетание для тренировки
8	3	9	Рекомендуемое сочетание для тренировки
9	3	10	Рекомендуемое сочетание для тренировки
\.


--
-- TOC entry 5286 (class 0 OID 57540)
-- Dependencies: 224
-- Data for Name: muscle_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.muscle_groups (id, name, description) FROM stdin;
1	Спина	Мышцы спины: широчайшие, трапеции, разгибатели спины
2	Грудь	Грудные мышцы
3	Ноги	Квадрицепсы, бицепсы бедра, ягодичные мышцы, икры
4	Бицепс	Двуглавая мышца плеча
5	Трицепс	Трёхглавая мышца плеча
6	Плечи	Дельтовидные мышцы
7	Пресс	Мышцы живота
8	Задняя дельта	Задний пучок дельтовидных мышц
9	Икры	Икроножные мышцы
10	Ягодицы	Ягодичные мышцы
11	Кардио	Аэробная нагрузка
\.


--
-- TOC entry 5298 (class 0 OID 73787)
-- Dependencies: 236
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, code, price_month, price_year, max_tasks, max_workouts, has_extended_stats, has_extended_exercises, has_ready_programs, has_progress_history, has_export, has_no_ads, description, created_at, updated_at) FROM stdin;
fe75751b-749e-4b57-936f-94989e2cec2b	Free	free	0.00	0.00	20	3	f	f	f	f	f	f	Бесплатный тариф с базовыми возможностями: задачи, календарь и ограниченное количество тренировок.	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
b24b89d3-10a7-412b-b88d-6c12ff55160b	Premium	premium	299.00	2490.00	\N	\N	t	t	t	t	t	t	Premium-тариф: неограниченные задачи и тренировки, расширенная статистика, готовые программы, история прогресса и экспорт данных.	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
\.


--
-- TOC entry 5283 (class 0 OID 57492)
-- Dependencies: 221
-- Data for Name: task_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_categories (id, name, color, created_at) FROM stdin;
1	Личное	#3b82f6	2026-05-08 18:00:10.429466
2	Учёба	#8b5cf6	2026-05-08 18:00:10.429466
3	Работа	#f59e0b	2026-05-08 18:00:10.429466
4	Здоровье	#10b981	2026-05-08 18:00:10.429466
5	Тренировка	#059669	2026-05-08 18:00:10.429466
\.


--
-- TOC entry 5296 (class 0 OID 65540)
-- Dependencies: 234
-- Data for Name: task_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_groups (id, user_id, name, created_at, updated_at, color) FROM stdin;
1a9265bb-e137-4e93-b4ab-7e5c8cd6a6d2	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	Учеба	2026-05-09 20:51:21.133255	2026-05-09 20:51:21.133255	#DBEAFE
e80e150d-55d1-4e1c-9b83-7f5ca0d25db4	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	gfdg	2026-05-11 12:51:01.481149	2026-05-11 12:51:01.481149	#DCFCE7
4510db58-8f05-4ce3-960e-cbf6f2bdf109	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	hgjghjgh	2026-05-11 23:23:24.086326	2026-05-11 23:23:24.086326	#FEE2E2
3c196622-156d-4d5c-a9ab-a186076e54a5	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	фывп	2026-05-27 23:24:55.882269	2026-05-27 23:24:55.882269	#DCFCE7
fc7d8f1e-c2cf-4da9-b260-e758a3219a8d	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	апап	2026-05-27 23:28:19.048122	2026-05-27 23:28:19.048122	#FEF2F2
9eb5ee74-6e4f-4124-98e9-3cf8c2315787	0ce96fe6-1b90-4816-a93e-f388ba244b19	Ремонт машины	2026-05-31 21:44:14.515701	2026-05-31 21:44:14.515701	#DBEAFE
\.


--
-- TOC entry 5295 (class 0 OID 57696)
-- Dependencies: 233
-- Data for Name: task_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_history (id, task_id, old_status, new_status, changed_at) FROM stdin;
5a534518-cbdf-453d-8a16-21f565133c23	d046408c-887c-421a-b146-ead9a4929f9a	new	completed	2026-05-28 01:39:02.424203
caa517b2-580c-48c4-a8db-8072a71cf2d4	80e5d2c1-7765-4a7b-9798-8cecce8fc2ad	completed	in_progress	2026-05-28 01:39:07.771065
ba044697-fadb-4f21-b9ef-1ffa3ee7477d	2aba0a05-7039-49d6-ae6b-f222f4802e1b	in_progress	completed	2026-05-31 21:43:52.833904
5740754e-e5da-4361-aabc-33fa9badc7c3	268beff3-9320-4c82-8c2f-b7ee1e5713e8	planned	in_progress	2026-05-31 21:48:50.546806
91b2f1f1-b5cd-4c92-a2b2-6a9bb210da6f	268beff3-9320-4c82-8c2f-b7ee1e5713e8	in_progress	completed	2026-05-31 21:48:50.932484
653cd340-c667-4214-8cca-b87cf5bf5d4e	268beff3-9320-4c82-8c2f-b7ee1e5713e8	completed	in_progress	2026-05-31 21:48:52.700367
d584457f-0138-4dce-a75c-fdbf8afd548b	a588a7d6-327a-460e-9a5d-0547a14a9f2a	planned	in_progress	2026-05-23 15:54:54.726558
3bbb7f9c-524b-43b5-9031-753fd63e015c	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	planned	2026-05-23 15:54:55.269774
5739052c-c4fc-44b9-8bb0-6f09879d1fd6	a588a7d6-327a-460e-9a5d-0547a14a9f2a	planned	in_progress	2026-05-24 19:52:05.979939
4d9321d4-74ae-4fff-ad94-ab3f6351f12b	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	completed	2026-05-24 19:52:06.359585
2aa009b4-53cf-4d3d-b4d3-d93d0c2dfe84	a588a7d6-327a-460e-9a5d-0547a14a9f2a	completed	in_progress	2026-05-24 19:52:06.657466
693ca50c-6212-4868-93e4-ce31d8cb5b46	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	planned	2026-05-24 19:52:06.923151
fa573452-373b-48b9-ae1e-7eb340626754	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-25 21:46:59.839183
7d496146-3b66-4251-ae88-b8892b8347cd	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-25 21:47:00.126245
0eb868a8-ecb4-40e1-a226-b38d34f527b9	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-25 21:47:00.5476
a5919219-de62-4995-ae86-7d234f71a8d8	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-25 21:47:00.762423
43dc2cd2-5026-47b7-95cc-b2989ee802df	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-25 21:47:01.071112
a8af257b-4626-4e20-bbf5-0b6175ba9a56	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-25 21:47:01.253314
dcc24ec2-2246-48e3-adc8-812b90706826	a588a7d6-327a-460e-9a5d-0547a14a9f2a	planned	in_progress	2026-05-25 21:47:01.819666
2a920c47-46d2-476c-ae37-5fd979054f24	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	completed	2026-05-25 21:47:02.030142
9527cd47-0006-426a-8580-72bd5f87fa01	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-25 21:47:02.375294
c54c509f-7e8d-4353-8ee1-6820fb4cf9bb	a588a7d6-327a-460e-9a5d-0547a14a9f2a	completed	in_progress	2026-05-25 21:47:02.824146
7024db30-04cd-4e9e-8183-93237dc08874	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	planned	2026-05-25 21:47:03.029507
12583ca5-0e6e-4ff6-8bc9-495fe8bdd572	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-25 21:47:03.300382
8f0fe76f-4a72-4b7c-b170-caef2d56534f	2aba0a05-7039-49d6-ae6b-f222f4802e1b	new	completed	2026-05-25 22:33:02.084321
26b7256d-3b44-4db8-a811-de95f5ca7a81	1de4638c-ade1-4924-b80e-c47eb80af1a8	new	completed	2026-05-26 00:15:05.33728
d8e238f6-6313-45a6-aaa8-37ae7bc26b8f	1de4638c-ade1-4924-b80e-c47eb80af1a8	completed	in_progress	2026-05-26 00:15:06.269258
da4a9d72-240b-426e-a4c2-e3833df499c1	2aba0a05-7039-49d6-ae6b-f222f4802e1b	completed	in_progress	2026-05-26 00:15:07.65968
bc8112c9-a388-43df-9f24-1c8fbea41c4c	1de4638c-ade1-4924-b80e-c47eb80af1a8	in_progress	completed	2026-05-26 00:15:08.139635
4311ce76-8dab-4e17-8657-35a67e755e55	1de4638c-ade1-4924-b80e-c47eb80af1a8	completed	in_progress	2026-05-26 00:15:08.959025
f5ad347d-38e0-4aab-8a73-87f27bcf3cd4	1de4638c-ade1-4924-b80e-c47eb80af1a8	in_progress	completed	2026-05-26 16:21:09.192276
d6c074f9-011c-437c-ad54-4c2c73c5face	2aba0a05-7039-49d6-ae6b-f222f4802e1b	in_progress	completed	2026-05-26 16:21:10.959744
cf6ed7cd-d825-4dec-8b91-46fbc42c4658	2aba0a05-7039-49d6-ae6b-f222f4802e1b	completed	in_progress	2026-05-26 16:21:15.295588
e8e0dc07-ef61-4b37-b1f6-894c272bf10a	1de4638c-ade1-4924-b80e-c47eb80af1a8	completed	in_progress	2026-05-26 16:21:16.002791
10726d59-ed80-4d73-922e-83f0032f29ba	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-26 19:50:17.872649
38bd77db-8ef3-4802-aeb1-84b39513444d	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-26 19:50:18.094
8a3d2704-9644-4425-94a1-1a3e5a2b578e	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-26 19:50:18.537318
9713d44f-c193-475d-a48c-8c6f3eab53c0	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-26 19:50:18.721955
09365971-0c23-4e0b-a61e-0c3ba9536e97	a588a7d6-327a-460e-9a5d-0547a14a9f2a	planned	in_progress	2026-05-26 19:50:19.02459
fcc925c6-9963-4087-a0ce-54f811e180e1	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	planned	2026-05-26 19:50:21.835429
4ea2c09f-8c8b-48ab-9c4c-45ba418f4244	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-26 19:50:22.157967
6fcb7c96-3c16-4192-9765-b306863368e0	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-26 19:50:22.383196
6b450b25-f848-46ef-85c9-d68fdcb3f070	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-26 19:50:22.612225
437feacb-3e6b-491b-b84a-d5be0168fbf1	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-26 19:50:22.797914
c4e7ae3f-8720-4ac4-b37b-41bcf6aec77d	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-26 19:55:47.930618
943de109-b304-46ea-be4c-b07a164d5826	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-26 19:55:48.098614
0ba1f94d-fd87-4ab2-aba8-160afd348708	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-26 19:55:48.636473
0c3c6833-02bd-4c3d-8c8e-8a0729ab80d6	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-26 19:55:48.870633
5acca617-7400-417a-8793-d83e6d827b9b	8a584d35-8769-4bfd-825d-f9aed940cad2	planned	completed	2026-05-27 20:44:12.468205
4f3c8904-3921-4623-9793-bc6d58594f41	8a584d35-8769-4bfd-825d-f9aed940cad2	completed	planned	2026-05-27 20:44:12.823702
7aaaa927-abbe-4f3f-bf59-feb04f4f3b3b	16eb4427-b5b0-4b59-804d-7e077e1bdaad	planned	in_progress	2026-05-27 21:41:02.334858
f8d460fa-b624-44d5-bb54-93150be4205d	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	completed	2026-05-27 21:41:02.643298
813ebe1f-3f11-46d0-866c-779581ea065c	16eb4427-b5b0-4b59-804d-7e077e1bdaad	completed	in_progress	2026-05-27 21:41:02.965567
d86c2e30-cc88-4081-83d4-d08d002ead4e	16eb4427-b5b0-4b59-804d-7e077e1bdaad	in_progress	planned	2026-05-27 21:41:03.191221
fc4f3916-de00-4478-8306-d9fd3edd1560	a588a7d6-327a-460e-9a5d-0547a14a9f2a	planned	in_progress	2026-05-27 21:41:03.848786
20e3eadd-92dd-4ff3-854f-57c0a0af353b	a588a7d6-327a-460e-9a5d-0547a14a9f2a	in_progress	planned	2026-05-27 21:41:05.684782
5a0e222e-ea41-4b9e-b139-bf50a0f1b075	44c44418-6a01-47c2-84ba-72dca64e6d31	planned	in_progress	2026-05-27 23:54:26.067213
15cb4cb9-e42c-43b0-8872-8fce789d2826	44c44418-6a01-47c2-84ba-72dca64e6d31	in_progress	completed	2026-05-27 23:54:26.780587
72f2835d-609e-44e2-84d1-99d94c8351c2	44c44418-6a01-47c2-84ba-72dca64e6d31	completed	in_progress	2026-05-27 23:54:31.217338
eb18c1ae-f168-4206-91cf-25941ba452ee	44c44418-6a01-47c2-84ba-72dca64e6d31	in_progress	planned	2026-05-27 23:54:31.68072
6e56b017-10e8-41a7-b061-5c49b9302de3	80e5d2c1-7765-4a7b-9798-8cecce8fc2ad	new	completed	2026-05-28 00:36:47.096786
b51b0e29-b7c2-4d88-a46d-c4e0caecba15	b163ff17-4e57-4d41-82e7-4b2eaaf91340	new	completed	2026-05-28 00:36:47.450161
1102946e-fdcb-4d62-8e3f-4d16a30e9cba	f48b6918-2ce0-4d9b-a7b7-bf3147c5eb66	new	completed	2026-05-28 00:36:48.211186
\.


--
-- TOC entry 5284 (class 0 OID 57505)
-- Dependencies: 222
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, user_id, category_id, title, description, task_type, status, priority, start_datetime, end_datetime, is_premium, created_at, updated_at, group_id, micro_step, subtasks) FROM stdin;
00c57983-2531-4a05-b8fe-fb488b87a349	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	Рабочий вес		regular	new	medium	\N	\N	f	2026-05-27 20:50:28.999649	2026-05-27 20:50:28.999649	\N		[{"id": "2179f31e-d408-48e5-ac33-f78f9b13455f", "title": "Добавить возможность удаления упражнения", "is_completed": false}, {"id": "92c4e511-1bea-4169-9926-4536b10dcae4", "title": "Цвета групп сделать насыщеннее", "is_completed": false}, {"id": "8d22013b-f513-4a2f-a1aa-cea8f64f4ba9", "title": "Сделать 5 основных цветов групп", "is_completed": false}]
80e5d2c1-7765-4a7b-9798-8cecce8fc2ad	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	ввввв	вввв	regular	in_progress	high	2026-05-29 22:02:00	\N	f	2026-05-28 00:27:24.149957	2026-05-28 01:39:07.771065	\N		[{"id": "877dd4a4-4ab7-41b3-8022-310c72638aef", "title": "ввв", "is_completed": true}, {"id": "873b288b-ab6e-4130-9a2f-322699cdeea0", "title": "вввв", "is_completed": true}]
a588a7d6-327a-460e-9a5d-0547a14a9f2a	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	пап		workout	planned	medium	\N	\N	f	2026-05-23 15:35:36.600863	2026-05-27 21:41:05.684782	\N	\N	[]
6f7dddaf-64b9-4806-b079-92c18834b9a6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	фывафыва		regular	new	high	\N	\N	f	2026-05-27 23:44:39.869471	2026-05-27 23:44:39.869471	\N		[]
53425c3a-1b85-40ce-b270-73a9a4a8ecb9	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	фывафыва		regular	new	medium	\N	\N	f	2026-05-28 00:04:10.732676	2026-05-28 00:04:10.732676	3c196622-156d-4d5c-a9ab-a186076e54a5		[]
8a584d35-8769-4bfd-825d-f9aed940cad2	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	zxc		workout	planned	medium	\N	\N	f	2026-05-27 20:44:11.502831	2026-05-28 00:08:23.434362	\N	\N	[]
048999b8-e4cf-4f0b-9dc9-a8c06949cff0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	ыв		workout	planned	medium	\N	\N	f	2026-05-28 01:41:26.732435	2026-05-28 01:41:26.732435	\N	\N	[]
44c44418-6a01-47c2-84ba-72dca64e6d31	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	фыва		workout	planned	medium	\N	\N	f	2026-05-27 22:44:58.964332	2026-05-27 23:54:31.68072	\N	\N	[]
1de4638c-ade1-4924-b80e-c47eb80af1a8	0ce96fe6-1b90-4816-a93e-f388ba244b19	1	Математика		regular	in_progress	medium	2026-05-31 06:59:00	\N	f	2026-05-26 00:14:12.048567	2026-05-31 21:43:24.373005	\N		[{"id": "40f22d21-78a9-4a02-bf95-e633fcb3bb49", "title": "Задача 243", "is_completed": false}, {"id": "67021f07-4b28-4e59-9272-6234470d187b", "title": "Задача 245", "is_completed": false}, {"id": "3c0f60d6-5dcf-45a8-a6c3-84ebd3d76a8f", "title": "Задача 249 (a,b)", "is_completed": false}]
16eb4427-b5b0-4b59-804d-7e077e1bdaad	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	попа		workout	planned	medium	\N	\N	f	2026-05-25 21:46:58.356596	2026-05-28 00:08:43.652257	\N	\N	[]
b163ff17-4e57-4d41-82e7-4b2eaaf91340	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	ыфва	фыва	regular	completed	medium	2026-05-29 12:00:00	\N	f	2026-05-28 00:26:08.306823	2026-05-28 00:36:47.450161	\N		[]
f48b6918-2ce0-4d9b-a7b7-bf3147c5eb66	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	asdf	sdaf	regular	completed	high	\N	\N	f	2026-05-27 23:41:38.288503	2026-05-28 00:36:48.211186	\N		[]
d046408c-887c-421a-b146-ead9a4929f9a	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	Моя тренировка		regular	completed	medium	\N	\N	f	2026-05-27 20:51:33.268697	2026-05-28 01:39:02.424203	\N		[{"id": "5fe6cdf5-147b-49cd-9860-6d17f62ba45d", "title": "Группы мышц отображаются неправильно у тренировки (на карточке)", "is_completed": true}]
2aba0a05-7039-49d6-ae6b-f222f4802e1b	0ce96fe6-1b90-4816-a93e-f388ba244b19	1	Покормить кота		regular	completed	medium	2026-05-31 12:00:00	\N	f	2026-05-25 22:33:00.489384	2026-05-31 21:43:57.404593	\N		[]
22f18a02-9f56-42e7-9bbe-44ccc9515040	0ce96fe6-1b90-4816-a93e-f388ba244b19	1	Починить дверь машины	Желательно до пятницы	regular	new	high	2026-06-05 12:00:00	\N	f	2026-05-31 21:44:43.199542	2026-05-31 21:44:43.199542	9eb5ee74-6e4f-4124-98e9-3cf8c2315787		[]
268beff3-9320-4c82-8c2f-b7ee1e5713e8	0ce96fe6-1b90-4816-a93e-f388ba244b19	5	Спина		workout	in_progress	medium	\N	\N	f	2026-05-31 21:48:47.986455	2026-05-31 21:48:52.700367	\N	\N	[]
\.


--
-- TOC entry 5307 (class 0 OID 106590)
-- Dependencies: 245
-- Data for Name: user_activity_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_activity_days (id, user_id, activity_date, created_at) FROM stdin;
3259	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-10	2026-05-20 22:52:41.722693
3260	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-11	2026-05-20 22:52:41.722693
3261	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-12	2026-05-20 22:52:41.722693
3262	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-13	2026-05-20 22:52:41.722693
3263	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-14	2026-05-20 22:52:41.722693
3264	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-15	2026-05-20 22:52:41.722693
3265	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-16	2026-05-20 22:52:41.722693
3266	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-17	2026-05-20 22:52:41.722693
3267	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-18	2026-05-20 22:52:41.722693
3274	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-03-31	2026-05-20 22:57:18.58215
3275	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-01	2026-05-20 22:57:18.58215
3276	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-02	2026-05-20 22:57:18.58215
3277	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-03	2026-05-20 22:57:18.58215
3278	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-04	2026-05-20 22:57:18.58215
3279	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-05	2026-05-20 22:57:18.58215
3280	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-06	2026-05-20 22:57:18.58215
3281	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-07	2026-05-20 22:57:18.58215
3282	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-08	2026-05-20 22:57:18.58215
3283	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-09	2026-05-20 22:57:18.58215
3284	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-10	2026-05-20 22:57:18.58215
3285	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-11	2026-05-20 22:57:18.58215
3286	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-12	2026-05-20 22:57:18.58215
3287	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-13	2026-05-20 22:57:18.58215
3288	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-14	2026-05-20 22:57:18.58215
3289	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-15	2026-05-20 22:57:18.58215
3290	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-16	2026-05-20 22:57:18.58215
3291	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-17	2026-05-20 22:57:18.58215
3292	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-18	2026-05-20 22:57:18.58215
3293	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-19	2026-05-20 22:57:18.58215
3294	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-20	2026-05-20 22:57:18.58215
3295	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-21	2026-05-20 22:57:18.58215
3296	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-22	2026-05-20 22:57:18.58215
3297	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-23	2026-05-20 22:57:18.58215
3298	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-24	2026-05-20 22:57:18.58215
3299	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-25	2026-05-20 22:57:18.58215
3300	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-26	2026-05-20 22:57:18.58215
3301	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-27	2026-05-20 22:57:18.58215
3302	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-28	2026-05-20 22:57:18.58215
3303	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-29	2026-05-20 22:57:18.58215
3304	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-04-30	2026-05-20 22:57:18.58215
3305	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-01	2026-05-20 22:57:18.58215
3306	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-02	2026-05-20 22:57:18.58215
3307	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-03	2026-05-20 22:57:18.58215
3308	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-04	2026-05-20 22:57:18.58215
3309	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-05	2026-05-20 22:57:18.58215
3310	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-06	2026-05-20 22:57:18.58215
3311	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-07	2026-05-20 22:57:18.58215
3312	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-08	2026-05-20 22:57:18.58215
3313	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-09	2026-05-20 22:57:18.58215
3323	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-19	2026-05-20 22:57:18.58215
3268	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-20	2026-05-20 22:52:43.982886
3332	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-21	2026-05-21 15:54:52.776747
3336	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-23	2026-05-23 14:45:44.088211
3497	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-25	2026-05-25 21:50:11.337821
3597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-26	2026-05-26 16:43:34.787922
3701	0ce96fe6-1b90-4816-a93e-f388ba244b19	2026-05-31	2026-05-31 21:55:09.729694
3477	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-24	2026-05-24 19:23:47.834548
3607	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-27	2026-05-27 20:44:15.029743
3417	39705cc8-35ea-427d-81e8-a7d11657cff0	2026-05-23	2026-05-23 17:20:03.779066
3509	0ce96fe6-1b90-4816-a93e-f388ba244b19	2026-05-25	2026-05-25 22:17:42.424945
3631	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-28	2026-05-28 00:48:20.845695
3702	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-31	2026-05-31 21:56:03.938789
3420	0ce96fe6-1b90-4816-a93e-f388ba244b19	2026-05-23	2026-05-23 17:21:30.598247
3580	0ce96fe6-1b90-4816-a93e-f388ba244b19	2026-05-26	2026-05-26 00:13:43.138745
2276	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-20	2026-05-20 22:47:53.683263
2277	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-31	2026-05-20 22:48:12.752364
2278	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-01	2026-05-20 22:48:12.752364
2279	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-02	2026-05-20 22:48:12.752364
2280	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-03	2026-05-20 22:48:12.752364
2281	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-04	2026-05-20 22:48:12.752364
2282	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-05	2026-05-20 22:48:12.752364
2283	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-06	2026-05-20 22:48:12.752364
2284	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-07	2026-05-20 22:48:12.752364
2285	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-08	2026-05-20 22:48:12.752364
2286	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-09	2026-05-20 22:48:12.752364
2287	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-10	2026-05-20 22:48:12.752364
2288	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-11	2026-05-20 22:48:12.752364
2289	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-12	2026-05-20 22:48:12.752364
2290	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-13	2026-05-20 22:48:12.752364
2291	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-14	2026-05-20 22:48:12.752364
2292	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-15	2026-05-20 22:48:12.752364
2293	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-16	2026-05-20 22:48:12.752364
2294	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-17	2026-05-20 22:48:12.752364
2295	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-18	2026-05-20 22:48:12.752364
2296	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-19	2026-05-20 22:48:12.752364
2297	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-20	2026-05-20 22:48:12.752364
2298	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-21	2026-05-20 22:48:12.752364
2299	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-22	2026-05-20 22:48:12.752364
2300	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-23	2026-05-20 22:48:12.752364
2301	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-24	2026-05-20 22:48:12.752364
2302	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-25	2026-05-20 22:48:12.752364
2303	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-26	2026-05-20 22:48:12.752364
2304	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-27	2026-05-20 22:48:12.752364
2305	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-28	2026-05-20 22:48:12.752364
2306	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-29	2026-05-20 22:48:12.752364
2307	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-04-30	2026-05-20 22:48:12.752364
2308	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-01	2026-05-20 22:48:12.752364
2309	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-02	2026-05-20 22:48:12.752364
2310	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-03	2026-05-20 22:48:12.752364
2311	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-04	2026-05-20 22:48:12.752364
2312	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-05	2026-05-20 22:48:12.752364
2313	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-06	2026-05-20 22:48:12.752364
2314	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-07	2026-05-20 22:48:12.752364
2315	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-08	2026-05-20 22:48:12.752364
2316	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-09	2026-05-20 22:48:12.752364
2317	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-10	2026-05-20 22:48:12.752364
2318	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-11	2026-05-20 22:48:12.752364
2319	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-12	2026-05-20 22:48:12.752364
2320	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-13	2026-05-20 22:48:12.752364
2321	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-14	2026-05-20 22:48:12.752364
2322	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-15	2026-05-20 22:48:12.752364
2323	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-16	2026-05-20 22:48:12.752364
2324	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-17	2026-05-20 22:48:12.752364
2325	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-18	2026-05-20 22:48:12.752364
2326	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-05-19	2026-05-20 22:48:12.752364
2331	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-09	2026-05-20 22:48:24.757822
2332	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-10	2026-05-20 22:48:24.757822
2333	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-11	2026-05-20 22:48:24.757822
2334	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-12	2026-05-20 22:48:24.757822
2335	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-13	2026-05-20 22:48:24.757822
2336	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-14	2026-05-20 22:48:24.757822
2337	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-15	2026-05-20 22:48:24.757822
2338	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-16	2026-05-20 22:48:24.757822
2339	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-17	2026-05-20 22:48:24.757822
2340	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-18	2026-05-20 22:48:24.757822
2341	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-19	2026-05-20 22:48:24.757822
2342	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-20	2026-05-20 22:48:24.757822
2343	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-21	2026-05-20 22:48:24.757822
2344	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-22	2026-05-20 22:48:24.757822
2345	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-23	2026-05-20 22:48:24.757822
2346	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-24	2026-05-20 22:48:24.757822
2347	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-25	2026-05-20 22:48:24.757822
2348	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-26	2026-05-20 22:48:24.757822
2349	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-27	2026-05-20 22:48:24.757822
2350	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-28	2026-05-20 22:48:24.757822
2351	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-01	2026-05-20 22:48:24.757822
2352	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-02	2026-05-20 22:48:24.757822
2353	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-03	2026-05-20 22:48:24.757822
2354	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-04	2026-05-20 22:48:24.757822
2355	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-05	2026-05-20 22:48:24.757822
2356	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-06	2026-05-20 22:48:24.757822
2357	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-07	2026-05-20 22:48:24.757822
2358	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-08	2026-05-20 22:48:24.757822
2359	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-09	2026-05-20 22:48:24.757822
2360	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-10	2026-05-20 22:48:24.757822
2361	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-11	2026-05-20 22:48:24.757822
2362	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-12	2026-05-20 22:48:24.757822
2363	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-13	2026-05-20 22:48:24.757822
2364	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-14	2026-05-20 22:48:24.757822
2365	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-15	2026-05-20 22:48:24.757822
2366	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-16	2026-05-20 22:48:24.757822
2367	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-17	2026-05-20 22:48:24.757822
2368	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-18	2026-05-20 22:48:24.757822
2369	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-19	2026-05-20 22:48:24.757822
2370	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-20	2026-05-20 22:48:24.757822
2371	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-21	2026-05-20 22:48:24.757822
2372	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-22	2026-05-20 22:48:24.757822
2373	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-23	2026-05-20 22:48:24.757822
2374	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-24	2026-05-20 22:48:24.757822
2375	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-25	2026-05-20 22:48:24.757822
2376	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-26	2026-05-20 22:48:24.757822
2377	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-27	2026-05-20 22:48:24.757822
2378	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-28	2026-05-20 22:48:24.757822
2379	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-29	2026-05-20 22:48:24.757822
2380	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-03-30	2026-05-20 22:48:24.757822
2435	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-28	2026-05-20 22:48:35.174918
2436	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-29	2026-05-20 22:48:35.174918
2437	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-30	2026-05-20 22:48:35.174918
2438	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-31	2026-05-20 22:48:35.174918
2439	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-01	2026-05-20 22:48:35.174918
2440	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-02	2026-05-20 22:48:35.174918
2441	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-03	2026-05-20 22:48:35.174918
2442	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-04	2026-05-20 22:48:35.174918
2443	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-05	2026-05-20 22:48:35.174918
2444	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-06	2026-05-20 22:48:35.174918
2445	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-07	2026-05-20 22:48:35.174918
2446	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-02-08	2026-05-20 22:48:35.174918
2551	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-15	2026-05-20 22:48:41.49023
2552	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-16	2026-05-20 22:48:41.49023
2553	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-17	2026-05-20 22:48:41.49023
2554	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-18	2026-05-20 22:48:41.49023
2555	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-19	2026-05-20 22:48:41.49023
2556	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-20	2026-05-20 22:48:41.49023
2557	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-21	2026-05-20 22:48:41.49023
2558	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-22	2026-05-20 22:48:41.49023
2559	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-23	2026-05-20 22:48:41.49023
2560	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-24	2026-05-20 22:48:41.49023
2561	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-25	2026-05-20 22:48:41.49023
2562	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-26	2026-05-20 22:48:41.49023
2563	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-27	2026-05-20 22:48:41.49023
2677	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-29	2026-05-20 22:48:49.729241
2678	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-30	2026-05-20 22:48:49.729241
2679	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-31	2026-05-20 22:48:49.729241
2680	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-01	2026-05-20 22:48:49.729241
2681	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-02	2026-05-20 22:48:49.729241
2682	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-03	2026-05-20 22:48:49.729241
2683	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-04	2026-05-20 22:48:49.729241
2684	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-05	2026-05-20 22:48:49.729241
2685	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-06	2026-05-20 22:48:49.729241
2686	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-07	2026-05-20 22:48:49.729241
2687	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-08	2026-05-20 22:48:49.729241
2688	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-09	2026-05-20 22:48:49.729241
2689	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-10	2026-05-20 22:48:49.729241
2690	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-11	2026-05-20 22:48:49.729241
2691	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-12	2026-05-20 22:48:49.729241
2692	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-13	2026-05-20 22:48:49.729241
2693	0d0871bf-5268-4090-a31f-eb0f80af1a93	2026-01-14	2026-05-20 22:48:49.729241
2823	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-05	2026-05-20 22:48:58.691099
2824	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-06	2026-05-20 22:48:58.691099
2825	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-07	2026-05-20 22:48:58.691099
2826	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-08	2026-05-20 22:48:58.691099
2827	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-09	2026-05-20 22:48:58.691099
2828	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-10	2026-05-20 22:48:58.691099
2829	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-11	2026-05-20 22:48:58.691099
2830	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-12	2026-05-20 22:48:58.691099
2831	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-13	2026-05-20 22:48:58.691099
2832	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-14	2026-05-20 22:48:58.691099
2833	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-15	2026-05-20 22:48:58.691099
2834	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-16	2026-05-20 22:48:58.691099
2835	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-17	2026-05-20 22:48:58.691099
2836	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-18	2026-05-20 22:48:58.691099
2837	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-19	2026-05-20 22:48:58.691099
2838	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-20	2026-05-20 22:48:58.691099
2839	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-21	2026-05-20 22:48:58.691099
2840	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-22	2026-05-20 22:48:58.691099
2841	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-23	2026-05-20 22:48:58.691099
2842	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-24	2026-05-20 22:48:58.691099
2843	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-25	2026-05-20 22:48:58.691099
2844	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-26	2026-05-20 22:48:58.691099
2845	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-27	2026-05-20 22:48:58.691099
2846	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-28	2026-05-20 22:48:58.691099
2993	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-13	2026-05-20 22:49:05.268712
2994	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-14	2026-05-20 22:49:05.268712
2995	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-15	2026-05-20 22:49:05.268712
2996	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-16	2026-05-20 22:49:05.268712
2997	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-17	2026-05-20 22:49:05.268712
2998	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-18	2026-05-20 22:49:05.268712
2999	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-19	2026-05-20 22:49:05.268712
3000	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-20	2026-05-20 22:49:05.268712
3001	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-21	2026-05-20 22:49:05.268712
3002	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-22	2026-05-20 22:49:05.268712
3003	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-23	2026-05-20 22:49:05.268712
3004	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-24	2026-05-20 22:49:05.268712
3005	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-25	2026-05-20 22:49:05.268712
3006	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-26	2026-05-20 22:49:05.268712
3007	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-27	2026-05-20 22:49:05.268712
3008	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-28	2026-05-20 22:49:05.268712
3009	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-29	2026-05-20 22:49:05.268712
3010	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-11-30	2026-05-20 22:49:05.268712
3011	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-01	2026-05-20 22:49:05.268712
3012	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-02	2026-05-20 22:49:05.268712
3013	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-03	2026-05-20 22:49:05.268712
3014	0d0871bf-5268-4090-a31f-eb0f80af1a93	2025-12-04	2026-05-20 22:49:05.268712
\.


--
-- TOC entry 5301 (class 0 OID 81969)
-- Dependencies: 239
-- Data for Name: user_exercise_metric_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_exercise_metric_history (id, metric_id, user_id, measure_type, weight_kg, reps_count, sets_count, distance_km, duration_seconds, recorded_at) FROM stdin;
d9549fc6-0e25-4ce7-afce-b7accda07b90	c6e9f554-2fcb-4d37-8f86-f043fa8c6c04	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	50.00	12	3	\N	\N	2026-05-15 00:33:01.857781
d7a728a1-77cc-4135-ae61-047876274d76	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	4.00	\N	\N	\N	\N	2026-05-19 09:13:52.278249
469c75e4-1af8-4004-88f9-704e04571cf3	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	5.00	\N	\N	\N	\N	2026-05-19 09:19:21.343648
74721acc-11a5-4f63-9e83-db5e325208dd	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	4.00	\N	\N	\N	\N	2026-05-19 09:19:21.666222
8a159316-e08d-4fe0-8f33-0dda54c414db	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	5.00	\N	\N	\N	\N	2026-05-19 09:19:23.716877
a04ac1bf-db49-4e49-af07-ab9113aac21a	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	4.00	\N	\N	\N	\N	2026-05-19 09:19:24.033197
c84f7e36-c226-47af-a0e2-8490214b5ac1	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	5.00	\N	\N	\N	\N	2026-05-19 09:19:24.326271
84682c4e-9246-4eef-89aa-31b0c88c7de9	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	4.00	\N	\N	\N	\N	2026-05-19 09:19:24.623121
0290da4c-f70b-49c9-9b42-658f4c6a72a0	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	3.00	\N	\N	\N	\N	2026-05-19 09:19:25.074387
1c20d268-4b7b-445c-9898-70db09da7a69	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	2.00	\N	\N	\N	\N	2026-05-19 09:19:25.224651
d0013a65-c117-4ada-93c9-fa7576c18a0a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	360	2026-05-19 09:19:31.390864
5326a78b-fbdb-40c3-8213-a42922ea07b8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3960	2026-05-19 09:19:31.566327
ce447d92-8460-414c-9556-f192e029c859	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	960	2026-05-19 09:19:31.666735
59378989-2c23-4ad8-9450-ebf75b8544d7	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	9960	2026-05-19 09:19:31.83574
1b052a23-a71d-415e-b218-7ebd5b5e4d66	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1560	2026-05-19 09:19:32.033245
23ae767a-6cbd-4389-9e69-931f910d7dd5	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	15960	2026-05-19 09:19:33.081955
e2f2e695-6844-421a-8519-5dd9dcc31496	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2760	2026-05-19 09:19:33.244795
4a5eb8b1-7ccf-49ec-9578-c2b9097cedd1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	27960	2026-05-19 09:19:33.426442
45d036c1-5dee-40d8-acae-071029243a62	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	4560	2026-05-19 09:19:33.579227
f1cb803b-10cc-432a-b20b-8c569feb2dbf	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	960	2026-05-19 09:19:33.747629
29a3192e-8248-4080-90d7-374a230b4bb2	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	9600	2026-05-19 09:19:34.52449
43ffc8f8-fc53-4643-aba2-60c9dbdade0a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1560	2026-05-19 09:19:35.205311
c20d4399-a8cb-4a67-9abf-4d623da11f18	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	15600	2026-05-19 09:19:35.355912
613b4a15-3162-4809-bfd5-7323e770db77	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2460	2026-05-19 09:19:36.482843
5705d62c-ac1b-4c62-b86d-91383e49637c	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	24900	2026-05-19 09:19:37.278381
d5161a8c-a020-41f6-b1ad-59e78319bc36	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	4140	2026-05-19 09:19:37.549328
beef26cc-a058-4319-a234-9d5227539101	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	900	2026-05-19 09:19:39.035467
3ce70f48-d59d-41b6-8fca-3046888cb774	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	9540	2026-05-19 09:19:39.131244
0677473c-d6e9-41b4-a8f3-25d35191c613	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	\N	2026-05-19 09:19:40.548346
1b086e4b-b611-4a8f-bdf3-d16205ab99d8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	300	2026-05-19 09:19:41.691188
8e3589db-50da-489d-9a4d-cd6f22fe2571	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3540	2026-05-19 09:19:41.898465
fb4a468a-3ec1-468b-837d-079fcfb91439	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	300	2026-05-19 09:19:42.795245
6419542e-80ad-4b32-ac19-4eece47c6326	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3360	2026-05-19 09:19:43.461162
319415d3-52b5-4ef5-93ef-897363823a51	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	33600	2026-05-19 09:19:43.713956
b0c04df9-e14c-4969-b921-785b3f641de5	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	540	2026-05-19 09:19:46.332016
cb38f828-f4a1-46c2-ab4d-71ec417a56d9	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	480	2026-05-19 09:19:49.08185
9e9b4dbd-27ab-4aec-8d15-e7ee899237f1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	420	2026-05-19 09:19:49.219325
58e1e47e-7a73-4e5c-b426-a28abb798dbe	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	360	2026-05-19 09:19:50.225645
2523c256-9353-458b-8de9-bc80088139e1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	300	2026-05-19 09:19:50.377526
38872cc2-65d8-4967-be38-a096eff3e9d6	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	240	2026-05-19 09:19:50.525335
3f8803b6-0e46-4813-acd9-e178e4d58db1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	180	2026-05-19 09:19:50.669482
c1a49c85-ebcc-4f09-8dfc-c45628c309d6	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	120	2026-05-19 09:19:50.948978
4ed9814a-db8d-4374-940f-c38ae0893ed9	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	60	2026-05-19 09:19:51.25549
816e4eb5-570b-4328-a61b-57b68e67ecdf	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	\N	2026-05-19 09:19:51.467638
cb6b2973-62fe-47f4-9373-426c9ea54951	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	\N	2026-05-19 09:19:51.840762
f05cf7a4-feba-41f9-89a6-3e24028c99b9	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	60	2026-05-19 09:19:53.466927
a429f3f9-e991-47d9-b577-cd2757f29155	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	120	2026-05-19 09:19:53.717093
49ea2c05-cc02-4030-80bc-0c50ceff483b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	180	2026-05-19 09:19:53.766255
848bce9d-1d77-4e60-befe-a301590d8306	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	240	2026-05-19 09:19:53.816107
eb0284bc-e7bc-4bf4-9761-7ae076f8eb3b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	300	2026-05-19 09:19:53.866016
014ff3ac-8ff7-4014-b430-636225acbe77	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	360	2026-05-19 09:19:53.916539
31f4d705-1186-4b3c-b061-45650c3e9015	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	420	2026-05-19 09:19:53.96724
24acb0bc-1641-4b84-95e1-3b486ce8c371	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	480	2026-05-19 09:19:54.015302
6e7408c6-2201-4159-85f7-7532caf611cb	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	540	2026-05-19 09:19:54.067189
5b2c84c0-cd9c-4f3f-b2c8-5c757e48b9d3	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	600	2026-05-19 09:19:54.116112
e13da382-ec8e-4aab-a7b0-26f78df03f96	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	660	2026-05-19 09:19:54.166113
e4f76023-898f-42cc-a09b-5da1fc944120	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	720	2026-05-19 09:19:54.216138
da8815e4-cc1f-4d49-912e-463c3b44e58a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	780	2026-05-19 09:19:54.266494
32d7d02c-3c6c-47f4-828a-ef88236063b1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	840	2026-05-19 09:19:54.316289
750f497a-ebf4-4014-b11e-9ca6d6593427	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	900	2026-05-19 09:19:54.3659
9e6ae02c-701f-45da-90bf-d049696df2dd	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	960	2026-05-19 09:19:54.416144
9f779d6e-0a05-4318-a332-15f5b4512f9b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1020	2026-05-19 09:19:54.465583
563d7ce9-8dd8-4c48-b086-2db6577a566f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1080	2026-05-19 09:19:54.516662
b887a897-79d1-4ddb-9cb0-50b8523dac29	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1140	2026-05-19 09:19:54.566191
dd50e9b4-151e-4942-9e5d-e60e24b612e8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1200	2026-05-19 09:19:54.615523
91df47b6-01e4-4d00-be15-4f64a2e729f4	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1260	2026-05-19 09:19:54.665495
a1ca0a51-4a7d-432f-bae4-9bc14e9c0a70	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1320	2026-05-19 09:19:54.715603
dcf98a8d-8cbf-4401-bce3-5b55993c42d0	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1380	2026-05-19 09:19:54.766051
227ffb79-2008-4b0f-accd-946a4461ca8e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1440	2026-05-19 09:19:54.815743
12fe5efa-a9c1-4f7b-91ce-bd4fc0efc60d	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1500	2026-05-19 09:19:54.866362
43ad18c5-e8ae-442b-bcfc-a92fdcdbd25d	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1560	2026-05-19 09:19:54.91606
ab781fe5-1cb8-466d-973b-f60a461631df	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1620	2026-05-19 09:19:54.965554
7eefe4dd-4f1a-4a31-995b-1e341d9a443e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1680	2026-05-19 09:19:55.016753
704f5fdc-b105-4b5b-a8b5-c23bbe22af48	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1740	2026-05-19 09:19:55.066216
9455cb8a-fcc7-43c8-b85f-711fd9254c11	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1800	2026-05-19 09:19:55.115555
89da2eba-c656-4391-b47d-9d8ca1a4f8c0	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1860	2026-05-19 09:19:55.165457
4ba7fa46-1e75-4935-867e-b4104f43d9a7	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1920	2026-05-19 09:19:55.216186
d4877fc3-112f-44f9-b369-90b0f961169b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1980	2026-05-19 09:19:55.265747
6aed3acc-0547-4449-b488-89a46eb13bd8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2040	2026-05-19 09:19:55.315748
cd54e77d-5e6b-4511-bdd2-e37caaf25a3f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2100	2026-05-19 09:19:55.366125
fa23b1fa-3782-4643-b1ec-7e5fe2063c9a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2160	2026-05-19 09:19:55.415351
01cf6042-c7c0-4ddb-875f-e7c880e4d43e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2220	2026-05-19 09:19:55.466653
baa6093d-3546-4e6c-8ff3-c26aea7635ae	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2280	2026-05-19 09:19:55.515798
daa3876e-00ef-4792-9ac1-d433f134a5f8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2340	2026-05-19 09:19:55.565274
9d71215b-47af-4e52-b138-7e9c34802ef0	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2400	2026-05-19 09:19:55.61561
3ef9eacc-8c92-45bf-b8b5-6fea9f9abb52	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2460	2026-05-19 09:19:55.665998
8624816d-bbd5-497d-981b-c1d4189ce838	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2520	2026-05-19 09:19:55.715761
644c56db-6e9b-4409-94a6-78ad6eb1f84e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2580	2026-05-19 09:19:55.76581
42ff0343-1719-42fa-9ccc-19d5601cec73	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2640	2026-05-19 09:19:55.815609
80098e30-3c19-4a31-a2a0-41bba99d54a4	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2700	2026-05-19 09:19:55.866118
26e5099c-e7b7-4c85-b311-8fadb1653597	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2760	2026-05-19 09:19:55.915922
d2073684-57e8-4cb4-b3cf-506002477e9e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2820	2026-05-19 09:19:55.965921
2456614a-c4e1-4e9e-b38c-f78f688ad4f8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2880	2026-05-19 09:19:56.015694
9ac71c4f-204a-44b7-9f34-53cc4539dc8c	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	2940	2026-05-19 09:19:56.065696
88c8ac8c-59f7-483e-9992-643814e6e03f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3000	2026-05-19 09:19:56.115934
c0ffa5c9-fb56-41e9-b5f8-fb56a7390245	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3060	2026-05-19 09:19:56.16557
b8180912-9f0b-4d09-8e57-3add9346cea0	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3120	2026-05-19 09:19:56.215356
988f3798-2723-4eba-b492-8b2c3977d012	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3180	2026-05-19 09:19:56.266279
03d845b7-4909-4187-915e-cc23ec07666c	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3240	2026-05-19 09:19:56.31564
3e0e9875-abeb-45a1-b63f-7cff423a9cad	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3300	2026-05-19 09:19:56.365291
f6a3e435-d6f4-49fc-a8d6-11c7534e8ee3	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3360	2026-05-19 09:19:56.41618
7949e828-a9b3-4bcb-9c86-bff627e98d2f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3420	2026-05-19 09:19:56.465573
ae03b8b6-293f-4931-be35-48d67fce202b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3480	2026-05-19 09:19:56.516206
d0cf6318-a83f-4f2d-9126-c0a20d31fc20	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3540	2026-05-19 09:19:56.565918
d24fd415-2345-4662-8376-6a773d671582	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	3600	2026-05-19 09:19:56.615106
5bb51b28-3dbb-47dd-9254-ffc6cfaad1da	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	120	2026-05-19 09:19:56.66595
83afae77-deb7-4abe-982f-0389d5ad59ae	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	180	2026-05-19 09:19:56.71517
a53161f6-9d2f-40a6-b569-a18604b0f350	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	240	2026-05-19 09:19:56.765787
5a5c265f-665e-43f0-a0bf-de5fe7e232aa	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	300	2026-05-19 09:19:56.816835
38a86ed7-57f4-4222-b1d8-574ed3822a40	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	360	2026-05-19 09:19:56.865457
68e11a23-e13d-4326-8527-f58823e8a863	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	420	2026-05-19 09:19:56.915468
7c2a8aa1-0d4d-43e1-9b20-9a15f41489c9	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	480	2026-05-19 09:19:56.966379
afff4fdf-dbd6-4f5d-8006-bf2afcce9870	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	540	2026-05-19 09:19:57.015966
52d818e5-2f26-4279-b051-796cf21d8893	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	600	2026-05-19 09:19:57.065298
efe4407d-0110-42be-aedf-816b4e867a66	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	660	2026-05-19 09:19:57.115345
fb2947cf-29a2-4d70-aa42-34c8c2c574fd	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	720	2026-05-19 09:19:57.165747
94dcb879-73d7-4038-8e7d-d86366c67a97	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	780	2026-05-19 09:19:57.215781
3359d6e2-f4ef-459e-93a6-e06c6ea34ede	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	840	2026-05-19 09:19:57.265957
279e3260-e56c-4841-a8fd-5ccff2033e6e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	900	2026-05-19 09:19:57.316265
be9e44bc-e579-4f02-a7dc-af98373b2b61	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	960	2026-05-19 09:19:57.36606
35adba66-9ace-45d9-ac41-9f188cc5939a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1020	2026-05-19 09:19:57.416675
efe7ef9f-16fa-4f7d-9be2-23d696f2255e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1080	2026-05-19 09:19:57.46527
7bc69447-c238-457e-a463-d52781844c47	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1140	2026-05-19 09:19:57.515932
ada96dd8-676b-4048-a06e-aaa56cbf0a71	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1200	2026-05-19 09:19:57.565663
931e76b7-15cc-47b5-b56d-0470db13efbe	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1260	2026-05-19 09:19:57.617093
3869937e-5843-47b0-bd4b-09db09af68f5	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1320	2026-05-19 09:19:57.66623
cb166543-8ee1-4858-973b-259c492155f8	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1380	2026-05-19 09:19:57.715729
cf3c192d-f77d-46cc-a0ef-a39e9cb5bdfb	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1440	2026-05-19 09:19:57.765393
3d463abd-aa67-45b8-9779-4aa310fd330a	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1500	2026-05-19 09:19:57.816935
c08094ad-b160-40b0-ab8b-33e5d8643837	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1560	2026-05-19 09:19:57.865904
93503035-66d2-418b-8789-80c11bd33e24	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1620	2026-05-19 09:19:57.915855
ff3f5bdd-5185-4083-847a-cb1c20a0a793	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1680	2026-05-19 09:19:57.965792
fbddeae2-8ceb-4bdd-a992-ca4c897bb815	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1740	2026-05-19 09:19:58.017343
1a833fb7-81ee-4c5a-8487-99fce7d1afcb	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	\N	2026-05-19 09:19:58.84219
02ad9463-7d28-460c-8515-12e784f6d0f6	c6e9f554-2fcb-4d37-8f86-f043fa8c6c04	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	5.00	\N	\N	\N	\N	2026-05-19 09:20:12.227659
3f8ace9b-b5b7-4cfc-affe-55f779c73352	c6e9f554-2fcb-4d37-8f86-f043fa8c6c04	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	\N	\N	\N	\N	\N	2026-05-19 09:20:12.364554
7194ee1c-4f98-43f3-99f7-94606874d3c3	90f020b5-8f35-439a-aa9a-c47520bde2a6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	480	2026-05-19 09:22:26.639294
fc7e1302-f79d-4ac8-9cc1-89e30dfe8cff	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	480	2026-05-19 09:22:26.686964
44beb615-aa7b-4adb-954c-e200fec81d6a	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	5280	2026-05-19 09:22:26.980809
dd33512d-3598-4c02-b07a-8e9ce99cddeb	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1080	2026-05-19 09:22:27.307721
6cfba76b-cec9-4698-ae54-98407234dc7b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	540	2026-05-19 09:25:50.751612
59bc1674-983a-4c6e-8bb1-b4a54464b5e1	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	5940	2026-05-19 09:25:50.874136
087806ad-14d7-4f59-88cb-953877124bd7	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	1140	2026-05-19 09:25:51.009455
57e9da53-8003-4bec-b8cc-7004e7c48b2e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	11940	2026-05-19 09:25:51.347178
230428a1-732e-4605-861c-00659e77db5b	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	37080	2026-05-19 09:28:22.707656
15a25e6f-d006-4027-bfe8-6e455a1d0e0b	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	6360	2026-05-19 09:28:22.94578
33ec17f3-1250-4677-9f5b-014e4127c809	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	\N	960	2026-05-19 09:28:23.234717
06c014fc-6772-45c6-adeb-f3eb40e420f6	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	6.00	180	2026-05-19 09:30:30.051316
ceb74d28-09c4-4f7c-afed-394814329b7b	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	66.00	180	2026-05-19 09:30:30.273913
9ce66d0e-c540-4cb7-8b3e-ae82aa3dcc80	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	666.00	180	2026-05-19 09:30:30.492916
168f0e00-20c7-4ce0-b800-31663abfd6dd	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	180	2026-05-19 09:30:31.002011
61b61a74-fde9-4fe1-85e0-9d02f0ea0ad0	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	36180	2026-05-19 09:30:31.834167
7f61159c-5613-42f5-81ac-35b7c2941aa2	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	6360	2026-05-19 09:30:31.987222
212c0638-a576-432d-81b3-e9ed70938903	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	960	2026-05-19 09:30:32.202053
ed9401fb-92bc-4ef1-aede-5303bc606e60	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	9960	2026-05-19 09:30:32.388147
13a0226a-1e17-4aeb-85b2-79f79e194751	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	1560	2026-05-19 09:30:32.675072
2b4c96da-7d3b-4ce8-a1db-a37adb2160c7	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	15960	2026-05-19 09:30:32.874109
51c26105-0257-466a-9001-57810326c4f5	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	2760	2026-05-19 09:30:33.089401
99725076-cfd1-4ff9-a589-b76e3f4d4d94	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	240	2026-05-19 09:30:35.010664
6e7a8347-6cee-45fe-9659-5f930302e50f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	\N	2026-05-19 09:30:35.237266
445f981d-03d6-4bee-8bd9-23b7c4ca2f28	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	\N	2026-05-19 09:30:41.42117
503c0024-b3dd-43ef-9364-1ae2d369e314	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	\N	2026-05-19 09:30:41.707339
e108ee76-9d02-4c9e-86db-f6b94bd132ca	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	3.00	\N	\N	\N	\N	2026-05-19 09:34:13.073651
728b20f9-c3b1-4c13-9ada-ac84a960625e	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	2.00	\N	\N	\N	\N	2026-05-19 09:34:13.400903
2c812519-ba0f-493e-a6b4-513f84bea93e	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	998.90	\N	2026-05-19 09:34:35.474544
07af89b6-738a-4d9d-ade9-ad5ad481c583	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	998.80	\N	2026-05-19 09:34:35.975184
f09fd5cf-852c-4c4f-846a-e95a7e041221	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	998.70	\N	2026-05-19 09:34:36.323565
d93cab84-8a40-42ab-8697-4b5b694e1aae	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	998.80	\N	2026-05-19 09:34:36.547209
1f293da5-2737-4536-b5a1-362438041e3f	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	998.90	\N	2026-05-19 09:34:36.712145
b6c8eca7-1898-4057-8cc3-1a32fdbef22d	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	\N	2026-05-19 09:34:36.861812
5e9230be-3b09-43b5-9314-52d3139f5d7c	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	60	2026-05-19 09:34:37.827594
e5be486b-a29e-4551-8b09-f2d7a201d955	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	999.00	\N	2026-05-19 09:34:42.004978
15a29128-fbdd-44f1-b6f3-cd8f5e3f72f6	08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	8.00	\N	\N	\N	\N	2026-05-19 10:28:29.375659
51aa0478-6955-4977-a346-3f5d7bfc8e89	3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	99.00	\N	2026-05-19 10:28:33.95251
8329759e-8c4c-4e97-9d20-64d3e0c882c1	4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	distance_time	\N	\N	\N	4.00	960	2026-05-19 10:30:14.864466
d608479c-ffd0-4199-b050-f357e1624e7f	efe01a11-57d0-4e9c-97ee-d7074327d981	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	999.00	\N	\N	\N	\N	2026-05-19 10:49:21.180488
c545c5b3-bdaa-412f-93f1-8e3468d38bc1	4d69f2de-c38e-4bf8-8afc-67fc0239372e	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	3.00	\N	\N	\N	\N	2026-05-20 20:08:04.198213
2988d722-c537-4019-be4c-48cc43eb8fc0	659c54dd-67c8-44d7-854e-cec8ca2ab260	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	35.00	\N	\N	\N	\N	2026-05-20 20:14:04.808573
e10c959b-fd4b-4af9-bb40-3f8bfb6831fb	0883406b-2f00-4e06-85fa-112bc902c6f0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	50.00	\N	\N	\N	\N	2026-05-20 21:41:54.37887
8a4e34e8-8470-4e7e-bd8c-b4f4f5be4988	9e9931a9-ab78-4903-8c26-3b8443efc3cb	0ce96fe6-1b90-4816-a93e-f388ba244b19	weight_reps	50.00	\N	\N	\N	\N	2026-05-26 00:14:20.537699
75b616dd-fd18-43e9-8bea-913d82dc45a1	35224b08-7435-4336-a55d-2594d39d3ba0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	weight_reps	50.00	\N	\N	\N	\N	2026-05-27 23:54:47.03061
\.


--
-- TOC entry 5300 (class 0 OID 81938)
-- Dependencies: 238
-- Data for Name: user_exercise_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_exercise_metrics (id, user_id, exercise_id, custom_exercise_name, measure_type, weight_kg, reps_count, sets_count, distance_km, duration_seconds, created_at, updated_at) FROM stdin;
c6e9f554-2fcb-4d37-8f86-f043fa8c6c04	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	6	\N	weight_reps	\N	\N	\N	\N	\N	2026-05-15 00:33:01.836846	2026-05-19 09:20:12.362914
90f020b5-8f35-439a-aa9a-c47520bde2a6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	91	\N	distance_time	\N	\N	\N	\N	480	2026-05-19 09:22:26.633107	2026-05-19 09:22:26.633107
08185c5b-41b5-4c42-9b24-c980b2e5c597	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	45	\N	weight_reps	8.00	\N	\N	\N	\N	2026-05-19 09:13:52.253869	2026-05-19 10:28:29.3719
3b8e4f00-647c-4d89-8864-ac10dd1354b6	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	69	\N	distance_time	\N	\N	\N	99.00	\N	2026-05-19 09:19:31.389604	2026-05-19 10:28:33.951492
4002f068-8328-4fd8-9641-7a4ecbc50785	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	91	\N	distance_time	\N	\N	\N	4.00	960	2026-05-19 09:22:26.672946	2026-05-19 10:30:14.860765
efe01a11-57d0-4e9c-97ee-d7074327d981	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	15	\N	weight_reps	999.00	\N	\N	\N	\N	2026-05-19 10:49:21.173527	2026-05-19 10:49:21.173527
4d69f2de-c38e-4bf8-8afc-67fc0239372e	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	3	\N	weight_reps	3.00	\N	\N	\N	\N	2026-05-20 20:08:04.101318	2026-05-20 20:08:04.101318
659c54dd-67c8-44d7-854e-cec8ca2ab260	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	4	\N	weight_reps	35.00	\N	\N	\N	\N	2026-05-20 20:14:04.801035	2026-05-20 20:14:04.801035
0883406b-2f00-4e06-85fa-112bc902c6f0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	30	\N	weight_reps	50.00	\N	\N	\N	\N	2026-05-20 21:41:54.325989	2026-05-20 21:41:54.325989
9e9931a9-ab78-4903-8c26-3b8443efc3cb	0ce96fe6-1b90-4816-a93e-f388ba244b19	1	\N	weight_reps	50.00	\N	\N	\N	\N	2026-05-26 00:14:20.508248	2026-05-26 00:14:20.508248
35224b08-7435-4336-a55d-2594d39d3ba0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	54	\N	weight_reps	50.00	\N	\N	\N	\N	2026-05-27 23:54:47.024138	2026-05-27 23:54:47.024138
\.


--
-- TOC entry 5303 (class 0 OID 90143)
-- Dependencies: 241
-- Data for Name: user_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_exercises (id, user_id, name, description, difficulty, equipment, is_premium, measure_type, measure_units, group_id, created_at) FROM stdin;
8d7ffd04-b697-4556-87de-49e110175edd	93ab140f-e796-40d9-99ae-76a4b954ec20	яячяччсячс	\N	Средняя	\N	f	distance_time	["kg", "km", "reps", "min"]	d2b0818a-8dee-437e-a679-8311e9abc050	2026-05-19 11:07:08.205856
60a7b27d-b061-47fa-a52e-08e63e5131a2	0ce96fe6-1b90-4816-a93e-f388ba244b19	вапр	\N	Средняя	\N	f	weight_reps	["kg"]	\N	2026-05-26 00:14:37.663701
219afa8e-8cd8-449f-8fdc-78be2830cc83	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	zxc	\N	Средняя	\N	f	weight_reps	["kg"]	\N	2026-05-27 20:44:11.502831
a26f56e2-3a5e-4342-b03a-a0307d23a2c3	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	пар	\N	Средняя	\N	f	weight_reps	["kg", "min"]	\N	2026-05-27 22:38:55.46618
\.


--
-- TOC entry 5309 (class 0 OID 122912)
-- Dependencies: 247
-- Data for Name: user_friends; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_friends (id, user_id, friend_id, created_at) FROM stdin;
917923a0-6591-4009-8df2-916b6b4621a2	39705cc8-35ea-427d-81e8-a7d11657cff0	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	2026-05-23 17:20:32.078168
ae3f0094-de9e-4585-adff-a6263f634edd	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	39705cc8-35ea-427d-81e8-a7d11657cff0	2026-05-23 17:20:32.078168
\.


--
-- TOC entry 5299 (class 0 OID 73822)
-- Dependencies: 237
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, user_id, plan_id, status, started_at, expires_at, created_at, updated_at) FROM stdin;
fe6e3079-7619-4763-89c7-e61330056bb6	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-12 21:15:22.991089	\N	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
1695e658-66fd-4cd6-ae15-0f8fabe2d10b	93ab140f-e796-40d9-99ae-76a4b954ec20	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-19 11:02:50.826389	\N	2026-05-19 11:02:50.826389	2026-05-19 11:02:50.826389
7bb6a368-d4f7-40ed-a946-35043674bb27	0d0871bf-5268-4090-a31f-eb0f80af1a93	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-20 22:47:53.582604	\N	2026-05-20 22:47:53.582604	2026-05-20 22:47:53.582604
4dc46829-b9cc-4143-a200-5143a6a7a947	39705cc8-35ea-427d-81e8-a7d11657cff0	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-23 17:19:59.237986	\N	2026-05-23 17:19:59.237986	2026-05-23 17:19:59.237986
87f1407e-df83-45b3-b740-9601e1790e25	0ce96fe6-1b90-4816-a93e-f388ba244b19	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-23 17:21:24.423517	\N	2026-05-23 17:21:24.423517	2026-05-23 17:21:24.423517
59be3e35-1d7d-4c76-83ef-00bb74b6daad	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	fe75751b-749e-4b57-936f-94989e2cec2b	cancelled	2026-05-12 22:03:49.693618	\N	2026-05-12 22:03:49.693618	2026-05-12 22:03:49.693618
deb76c82-dbe7-4398-9810-25830278f7e1	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	b24b89d3-10a7-412b-b88d-6c12ff55160b	active	2026-05-25 22:15:28.020589	2027-05-25 22:15:28.020589	2026-05-25 22:15:28.020589	2026-05-25 22:15:28.020589
\.


--
-- TOC entry 5297 (class 0 OID 73762)
-- Dependencies: 235
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, is_guest, avatar_url, created_at, updated_at) FROM stdin;
27da5183-101e-4e2a-a0b2-22bcf9ef8e37	demo_user	demo@sunday.local	temporary_hash_change_after_auth_setup	user	f	\N	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
93ab140f-e796-40d9-99ae-76a4b954ec20	zxc	zcx@zxc	$2b$10$K3ljw88FRm2FMgGpPmzw7uRKSKKyYzCGmpUL0968uzKVx.2SG6S02	user	f	\N	2026-05-19 11:02:50.826389	2026-05-19 11:02:50.826389
0ce96fe6-1b90-4816-a93e-f388ba244b19	zxczxc	zxc@zxczxc	$2b$10$mJdXio6ockZD08ukr2nZ7ObjY558.j2VUpGGDq9fdWeXCFuJ7Zhc6	user	f	/uploads/avatars/0ce96fe6-1b90-4816-a93e-f388ba244b19-1779546420225.jpg	2026-05-23 17:21:24.423517	2026-05-23 17:21:24.423517
6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	z_666_z	dinar190100@gmail.com	$2b$10$W9T5qMNsZ/8TKiYDvFUAH.Jb0VmQDliWjgWlpb4xRkYuk5m3JPSvO	user	f	/uploads/avatars/6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa-1779542071305.png	2026-05-12 22:03:49.693618	2026-05-12 22:03:49.693618
0d0871bf-5268-4090-a31f-eb0f80af1a93	123	123@123	$2b$10$iuD3HkJbdwKeZvUgbtfVAuzXDu0EvYN3RJMnN2nnCPi4.NZbV/zSm	user	f	\N	2026-05-20 22:47:53.582604	2026-05-20 22:47:53.582604
39705cc8-35ea-427d-81e8-a7d11657cff0	ZXC	zxc@zxc	$2b$10$TQeeYlfq72pq6LlYKtvokeLzBNXlFGK/iB8kLa4VdJqXCGbY5GjMm	user	f	/uploads/avatars/39705cc8-35ea-427d-81e8-a7d11657cff0-1779546006414.jpg	2026-05-23 17:19:59.237986	2026-05-23 17:19:59.237986
\.


--
-- TOC entry 5293 (class 0 OID 57642)
-- Dependencies: 231
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_exercises (id, workout_id, exercise_id, sets_count, reps_count, weight_kg, exercise_order, notes, is_completed, user_exercise_id) FROM stdin;
9fd0e600-54dc-48db-ae89-62a9a09634df	d4e462f6-6d96-42c5-bbe1-0fbb90f8e693	2	0	\N	\N	1	\N	f	\N
b2a1cf95-a364-4ef4-b731-2fa5cbc006ce	d4e462f6-6d96-42c5-bbe1-0fbb90f8e693	53	10	\N	50.00	1	\N	f	\N
f896dc65-4ecb-4f37-bfa7-33aebdd05be6	d4e462f6-6d96-42c5-bbe1-0fbb90f8e693	54	3	\N	10.00	1	\N	f	\N
2cf876e7-d30d-4e12-914a-d1f6531ada4f	1b30a7d6-a72b-4b03-affc-4c0856bacb60	\N	0	\N	\N	1	\N	f	219afa8e-8cd8-449f-8fdc-78be2830cc83
918668d8-50af-4d4e-90f4-2419ce83acbc	9b1d029d-e49c-4412-bc0f-cbc8cdf5bf88	1	5	9	50.00	1	\N	f	\N
92490fb6-71d5-47ee-8e2d-88da22c1f92a	9b1d029d-e49c-4412-bc0f-cbc8cdf5bf88	65	5	\N	60.00	1	\N	f	\N
53bea329-e40d-412b-a48c-c7450c7b65ab	6b831b8c-dfa4-45e1-af9d-bf406f131914	14	0	\N	\N	1	\N	f	\N
e93d3418-4b6d-4d8f-8f95-ad5631c982d3	d2195087-5cae-486b-aa12-1c7a2555a663	2	4	\N	70.00	1	\N	t	\N
9b9b1205-e9c6-4f4e-907c-e2ac67498aff	d2195087-5cae-486b-aa12-1c7a2555a663	1	4	5	\N	1	\N	f	\N
d924463b-71e2-4b9f-8ea1-29bb4f6d125f	42dd3dab-a6bf-445d-9dc5-b86d287de117	\N	3	\N	55.00	1	\N	f	\N
051146c5-54b3-4ffc-95a5-f68532f1f3af	42dd3dab-a6bf-445d-9dc5-b86d287de117	1	0	\N	50.00	1	\N	f	\N
\.


--
-- TOC entry 5292 (class 0 OID 57615)
-- Dependencies: 230
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workouts (id, task_id, main_muscle_group_id, duration_minutes, notes, created_at, updated_at, repeat_days) FROM stdin;
42dd3dab-a6bf-445d-9dc5-b86d287de117	a588a7d6-327a-460e-9a5d-0547a14a9f2a	2	\N	\N	2026-05-23 15:35:36.600863	2026-05-23 17:41:00.822046	{}
d4e462f6-6d96-42c5-bbe1-0fbb90f8e693	44c44418-6a01-47c2-84ba-72dca64e6d31	2	\N	\N	2026-05-27 22:44:58.964332	2026-05-27 23:54:23.015717	{}
1b30a7d6-a72b-4b03-affc-4c0856bacb60	8a584d35-8769-4bfd-825d-f9aed940cad2	2	\N	\N	2026-05-27 20:44:11.502831	2026-05-28 00:08:23.434362	{}
9b1d029d-e49c-4412-bc0f-cbc8cdf5bf88	16eb4427-b5b0-4b59-804d-7e077e1bdaad	2	\N	\N	2026-05-25 21:46:58.356596	2026-05-28 00:08:43.652257	{}
6b831b8c-dfa4-45e1-af9d-bf406f131914	048999b8-e4cf-4f0b-9dc9-a8c06949cff0	2	\N	\N	2026-05-28 01:41:26.732435	2026-05-28 01:41:26.732435	{}
d2195087-5cae-486b-aa12-1c7a2555a663	268beff3-9320-4c82-8c2f-b7ee1e5713e8	1	\N	\N	2026-05-31 21:48:47.986455	2026-05-31 21:48:47.986455	{}
\.


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 242
-- Name: exercise_guides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercise_guides_id_seq', 79, true);


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 225
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_id_seq', 100, true);


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 228
-- Name: muscle_group_combinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscle_group_combinations_id_seq', 9, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 223
-- Name: muscle_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscle_groups_id_seq', 11, true);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 220
-- Name: task_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_categories_id_seq', 5, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 244
-- Name: user_activity_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_activity_days_id_seq', 3703, true);


--
-- TOC entry 5041 (class 2606 OID 57685)
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 90130)
-- Name: exercise_groups exercise_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 90132)
-- Name: exercise_groups exercise_groups_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_user_id_name_key UNIQUE (user_id, name);


--
-- TOC entry 5086 (class 2606 OID 106550)
-- Name: exercise_guides exercise_guides_exercise_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_guides
    ADD CONSTRAINT exercise_guides_exercise_id_key UNIQUE (exercise_id);


--
-- TOC entry 5088 (class 2606 OID 106548)
-- Name: exercise_guides exercise_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_guides
    ADD CONSTRAINT exercise_guides_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 57579)
-- Name: exercise_muscle_groups exercise_muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_pkey PRIMARY KEY (exercise_id, muscle_group_id);


--
-- TOC entry 5022 (class 2606 OID 57570)
-- Name: exercises exercises_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_name_key UNIQUE (name);


--
-- TOC entry 5024 (class 2606 OID 57568)
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5094 (class 2606 OID 122900)
-- Name: friend_requests friend_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_requests
    ADD CONSTRAINT friend_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 57602)
-- Name: muscle_group_combinations muscle_group_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 57551)
-- Name: muscle_groups muscle_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_name_key UNIQUE (name);


--
-- TOC entry 5020 (class 2606 OID 57549)
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 73821)
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- TOC entry 5062 (class 2606 OID 73819)
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- TOC entry 5064 (class 2606 OID 73817)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 57504)
-- Name: task_categories task_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories
    ADD CONSTRAINT task_categories_name_key UNIQUE (name);


--
-- TOC entry 5007 (class 2606 OID 57502)
-- Name: task_categories task_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories
    ADD CONSTRAINT task_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 65552)
-- Name: task_groups task_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_groups
    ADD CONSTRAINT task_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 57706)
-- Name: task_history task_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 57528)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 57604)
-- Name: muscle_group_combinations unique_muscle_combination; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT unique_muscle_combination UNIQUE (main_muscle_group_id, recommended_muscle_group_id);


--
-- TOC entry 5050 (class 2606 OID 65554)
-- Name: task_groups unique_task_group_per_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_groups
    ADD CONSTRAINT unique_task_group_per_user UNIQUE (user_id, name);


--
-- TOC entry 5090 (class 2606 OID 106601)
-- Name: user_activity_days user_activity_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_days
    ADD CONSTRAINT user_activity_days_pkey PRIMARY KEY (id);


--
-- TOC entry 5092 (class 2606 OID 106603)
-- Name: user_activity_days user_activity_days_user_id_activity_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_days
    ADD CONSTRAINT user_activity_days_user_id_activity_date_key UNIQUE (user_id, activity_date);


--
-- TOC entry 5076 (class 2606 OID 81981)
-- Name: user_exercise_metric_history user_exercise_metric_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 81958)
-- Name: user_exercise_metrics user_exercise_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 90162)
-- Name: user_exercises user_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 90164)
-- Name: user_exercises user_exercises_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_user_id_name_key UNIQUE (user_id, name);


--
-- TOC entry 5097 (class 2606 OID 122923)
-- Name: user_friends user_friends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT user_friends_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 122925)
-- Name: user_friends user_friends_user_id_friend_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT user_friends_user_id_friend_id_key UNIQUE (user_id, friend_id);


--
-- TOC entry 5068 (class 2606 OID 73839)
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5054 (class 2606 OID 73786)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5056 (class 2606 OID 73782)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 73784)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5039 (class 2606 OID 57657)
-- Name: workout_exercises workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 57629)
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 57631)
-- Name: workouts workouts_task_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_task_id_key UNIQUE (task_id);


--
-- TOC entry 5095 (class 1259 OID 122911)
-- Name: friend_requests_unique_pending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX friend_requests_unique_pending ON public.friend_requests USING btree (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)) WHERE ((status)::text = 'pending'::text);


--
-- TOC entry 5042 (class 1259 OID 57719)
-- Name: idx_calendar_events_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_start_datetime ON public.calendar_events USING btree (start_datetime);


--
-- TOC entry 5043 (class 1259 OID 57718)
-- Name: idx_calendar_events_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events USING btree (user_id);


--
-- TOC entry 5027 (class 1259 OID 57722)
-- Name: idx_exercise_muscle_groups_muscle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exercise_muscle_groups_muscle ON public.exercise_muscle_groups USING btree (muscle_group_id);


--
-- TOC entry 5046 (class 1259 OID 65565)
-- Name: idx_task_groups_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_groups_user_id ON public.task_groups USING btree (user_id);


--
-- TOC entry 5008 (class 1259 OID 57713)
-- Name: idx_tasks_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_category_id ON public.tasks USING btree (category_id);


--
-- TOC entry 5009 (class 1259 OID 65566)
-- Name: idx_tasks_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_group_id ON public.tasks USING btree (group_id);


--
-- TOC entry 5010 (class 1259 OID 57715)
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- TOC entry 5011 (class 1259 OID 57716)
-- Name: idx_tasks_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_start_datetime ON public.tasks USING btree (start_datetime);


--
-- TOC entry 5012 (class 1259 OID 57714)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 5013 (class 1259 OID 57717)
-- Name: idx_tasks_task_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_task_type ON public.tasks USING btree (task_type);


--
-- TOC entry 5014 (class 1259 OID 57712)
-- Name: idx_tasks_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);


--
-- TOC entry 5073 (class 1259 OID 81994)
-- Name: idx_user_exercise_metric_history_metric_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metric_history_metric_id ON public.user_exercise_metric_history USING btree (metric_id);


--
-- TOC entry 5074 (class 1259 OID 81995)
-- Name: idx_user_exercise_metric_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metric_history_user_id ON public.user_exercise_metric_history USING btree (user_id);


--
-- TOC entry 5069 (class 1259 OID 81993)
-- Name: idx_user_exercise_metrics_exercise_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metrics_exercise_id ON public.user_exercise_metrics USING btree (exercise_id);


--
-- TOC entry 5070 (class 1259 OID 81992)
-- Name: idx_user_exercise_metrics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metrics_user_id ON public.user_exercise_metrics USING btree (user_id);


--
-- TOC entry 5065 (class 1259 OID 73853)
-- Name: idx_user_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);


--
-- TOC entry 5066 (class 1259 OID 73852)
-- Name: idx_user_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);


--
-- TOC entry 5051 (class 1259 OID 73850)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5052 (class 1259 OID 73851)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5032 (class 1259 OID 57721)
-- Name: idx_workouts_main_muscle_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_main_muscle_group_id ON public.workouts USING btree (main_muscle_group_id);


--
-- TOC entry 5033 (class 1259 OID 57720)
-- Name: idx_workouts_task_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_task_id ON public.workouts USING btree (task_id);


--
-- TOC entry 5133 (class 2620 OID 57727)
-- Name: calendar_events trg_calendar_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5134 (class 2620 OID 65567)
-- Name: task_groups trg_task_groups_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_task_groups_updated_at BEFORE UPDATE ON public.task_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5130 (class 2620 OID 57729)
-- Name: tasks trg_task_status_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_task_status_history AFTER UPDATE OF status ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.save_task_status_history();


--
-- TOC entry 5131 (class 2620 OID 57725)
-- Name: tasks trg_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5132 (class 2620 OID 57726)
-- Name: workouts trg_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5113 (class 2606 OID 57691)
-- Name: calendar_events calendar_events_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5121 (class 2606 OID 90133)
-- Name: exercise_groups exercise_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 106551)
-- Name: exercise_guides exercise_guides_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_guides
    ADD CONSTRAINT exercise_guides_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 57580)
-- Name: exercise_muscle_groups exercise_muscle_groups_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- TOC entry 5105 (class 2606 OID 57585)
-- Name: exercise_muscle_groups exercise_muscle_groups_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_muscle_group_id_fkey FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5103 (class 2606 OID 90138)
-- Name: exercises exercises_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.exercise_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5126 (class 2606 OID 122906)
-- Name: friend_requests friend_requests_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_requests
    ADD CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 122901)
-- Name: friend_requests friend_requests_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_requests
    ADD CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5106 (class 2606 OID 57605)
-- Name: muscle_group_combinations muscle_group_combinations_main_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_main_muscle_group_id_fkey FOREIGN KEY (main_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 57610)
-- Name: muscle_group_combinations muscle_group_combinations_recommended_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_recommended_muscle_group_id_fkey FOREIGN KEY (recommended_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 57707)
-- Name: task_history task_history_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 57534)
-- Name: tasks tasks_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.task_categories(id) ON DELETE SET NULL;


--
-- TOC entry 5101 (class 2606 OID 65560)
-- Name: tasks tasks_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.task_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5102 (class 2606 OID 73854)
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 106604)
-- Name: user_activity_days user_activity_days_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_days
    ADD CONSTRAINT user_activity_days_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 81982)
-- Name: user_exercise_metric_history user_exercise_metric_history_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.user_exercise_metrics(id) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 81987)
-- Name: user_exercise_metric_history user_exercise_metric_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 81964)
-- Name: user_exercise_metrics user_exercise_metrics_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL;


--
-- TOC entry 5118 (class 2606 OID 81959)
-- Name: user_exercise_metrics user_exercise_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 90170)
-- Name: user_exercises user_exercises_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.exercise_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5123 (class 2606 OID 90165)
-- Name: user_exercises user_exercises_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 122931)
-- Name: user_friends user_friends_friend_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT user_friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 122926)
-- Name: user_friends user_friends_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_friends
    ADD CONSTRAINT user_friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 73845)
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- TOC entry 5116 (class 2606 OID 73840)
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5110 (class 2606 OID 57663)
-- Name: workout_exercises workout_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;


--
-- TOC entry 5111 (class 2606 OID 114692)
-- Name: workout_exercises workout_exercises_user_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_user_exercise_id_fkey FOREIGN KEY (user_exercise_id) REFERENCES public.user_exercises(id) ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 57658)
-- Name: workout_exercises workout_exercises_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 57637)
-- Name: workouts workouts_main_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_main_muscle_group_id_fkey FOREIGN KEY (main_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5109 (class 2606 OID 57632)
-- Name: workouts workouts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


-- Completed on 2026-05-31 22:49:25

--
-- PostgreSQL database dump complete
--

\unrestrict oiY0fs6HHXXdh0kpl7x7LjyPdm6UuLIryT5peYcbTNMor7ENMRPscmrvKB358ca

