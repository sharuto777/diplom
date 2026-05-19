--
-- PostgreSQL database dump
--

\restrict C0du1SPtm9l064dsxRbmUn4MEi2pCg1ia9Vdwmfiq5qhwh8LLh5ANJB7pcGvUup

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-19 11:13:32

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
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 922 (class 1247 OID 57416)
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'expired',
    'cancelled'
);


ALTER TYPE public.subscription_status OWNER TO postgres;

--
-- TOC entry 916 (class 1247 OID 57402)
-- Name: task_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.task_priority OWNER TO postgres;

--
-- TOC entry 913 (class 1247 OID 57388)
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
-- TOC entry 919 (class 1247 OID 57410)
-- Name: task_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_type AS ENUM (
    'regular',
    'workout'
);


ALTER TYPE public.task_type OWNER TO postgres;

--
-- TOC entry 280 (class 1255 OID 57728)
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
-- TOC entry 279 (class 1255 OID 57723)
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
-- TOC entry 5251 (class 0 OID 0)
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
-- TOC entry 5252 (class 0 OID 0)
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
-- TOC entry 5253 (class 0 OID 0)
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
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 225
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


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
-- TOC entry 5255 (class 0 OID 0)
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
-- TOC entry 5256 (class 0 OID 0)
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
-- TOC entry 5257 (class 0 OID 0)
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
-- TOC entry 5258 (class 0 OID 0)
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
-- TOC entry 5259 (class 0 OID 0)
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
-- TOC entry 5260 (class 0 OID 0)
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
-- TOC entry 5261 (class 0 OID 0)
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
    CONSTRAINT check_task_time CHECK (((end_datetime IS NULL) OR (start_datetime IS NULL) OR (end_datetime >= start_datetime)))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 5262 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tasks IS 'Основная таблица задач. Тренировка является специальным типом задачи';


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
    exercise_id integer NOT NULL,
    sets_count integer,
    reps_count integer,
    weight_kg numeric(6,2),
    exercise_order integer DEFAULT 1 NOT NULL,
    notes text,
    is_completed boolean DEFAULT false,
    CONSTRAINT check_reps_count CHECK (((reps_count IS NULL) OR (reps_count > 0))),
    CONSTRAINT check_sets_count CHECK (((sets_count IS NULL) OR (sets_count > 0))),
    CONSTRAINT check_weight CHECK (((weight_kg IS NULL) OR (weight_kg >= (0)::numeric)))
);


ALTER TABLE public.workout_exercises OWNER TO postgres;

--
-- TOC entry 5263 (class 0 OID 0)
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
-- TOC entry 5264 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE workouts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.workouts IS 'Тренировочная информация, связанная с задачей типа workout';


--
-- TOC entry 4889 (class 2604 OID 57556)
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 57594)
-- Name: muscle_group_combinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations ALTER COLUMN id SET DEFAULT nextval('public.muscle_group_combinations_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 57543)
-- Name: muscle_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups ALTER COLUMN id SET DEFAULT nextval('public.muscle_groups_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 57495)
-- Name: task_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories ALTER COLUMN id SET DEFAULT nextval('public.task_categories_id_seq'::regclass);


--
-- TOC entry 5235 (class 0 OID 57668)
-- Dependencies: 232
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (id, user_id, task_id, title, description, start_datetime, end_datetime, color, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5243 (class 0 OID 90118)
-- Dependencies: 240
-- Data for Name: exercise_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercise_groups (id, user_id, name, color, created_at) FROM stdin;
71688562-1467-46b7-a026-88cf6b8b36ed	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	Кардио	#FFFBEB	2026-05-19 10:20:44.226779
fe4c162a-337f-4df8-a518-15adcc054184	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Спина	#E6F8FA	2026-05-19 10:43:27.21257
aa3ba5ee-b20a-40cb-815a-9b28d4cb9ea4	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Грудь	#ECFDF5	2026-05-19 10:43:27.21257
050c9a3a-4ea6-4ad0-a6c8-9a99332de9e3	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Ноги	#FFFBEB	2026-05-19 10:43:27.21257
2345b207-c5c4-491e-ad2f-fb6f09cf0648	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Плечи	#F5F3FF	2026-05-19 10:43:27.21257
bb9c346a-79bc-40b5-8e6b-9f60d4666e36	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Бицепс	#EFF6FF	2026-05-19 10:43:27.21257
5f7d46fd-6229-40cd-a36b-1665d3072afd	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Трицепс	#FEF2F2	2026-05-19 10:43:27.21257
969f810d-dc95-4d20-9b72-6eb3b59c2e3e	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Пресс	#F8FAFC	2026-05-19 10:43:27.21257
9a93786c-4dd5-441c-bd68-a897b2873823	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Ягодицы	#FCE7F3	2026-05-19 10:43:27.21257
4f28c40e-878b-4bd9-8e8c-06949db51811	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	Кардио	#E0F2FE	2026-05-19 10:43:27.21257
4eec3179-6391-4108-ac6f-871f07dc0e89	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	День ног	#F5F3FF	2026-05-19 11:01:45.665976
d2b0818a-8dee-437e-a679-8311e9abc050	93ab140f-e796-40d9-99ae-76a4b954ec20	бум бум бум	#FEF2F2	2026-05-19 11:07:01.676972
\.


--
-- TOC entry 5230 (class 0 OID 57571)
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
-- TOC entry 5229 (class 0 OID 57553)
-- Dependencies: 226
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, name, description, difficulty, equipment, is_premium, created_at, name_ru, description_ru, source, source_id, external_category, external_muscles, external_equipment, measure_type, measure_units, group_id) FROM stdin;
1	Подтягивания	Базовое упражнение для развития мышц спины и рук	Высокая	Турник	f	2026-05-08 18:00:10.429466	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
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
100	авава	\N	Средняя	\N	f	2026-05-19 10:28:15.441638	\N	\N	\N	\N	\N	\N	\N	weight_reps	["kg"]	\N
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
-- TOC entry 5232 (class 0 OID 57591)
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
-- TOC entry 5227 (class 0 OID 57540)
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
-- TOC entry 5239 (class 0 OID 73787)
-- Dependencies: 236
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, code, price_month, price_year, max_tasks, max_workouts, has_extended_stats, has_extended_exercises, has_ready_programs, has_progress_history, has_export, has_no_ads, description, created_at, updated_at) FROM stdin;
fe75751b-749e-4b57-936f-94989e2cec2b	Free	free	0.00	0.00	20	3	f	f	f	f	f	f	Бесплатный тариф с базовыми возможностями: задачи, календарь и ограниченное количество тренировок.	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
b24b89d3-10a7-412b-b88d-6c12ff55160b	Premium	premium	299.00	2490.00	\N	\N	t	t	t	t	t	t	Premium-тариф: неограниченные задачи и тренировки, расширенная статистика, готовые программы, история прогресса и экспорт данных.	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
\.


--
-- TOC entry 5224 (class 0 OID 57492)
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
-- TOC entry 5237 (class 0 OID 65540)
-- Dependencies: 234
-- Data for Name: task_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_groups (id, user_id, name, created_at, updated_at, color) FROM stdin;
1a9265bb-e137-4e93-b4ab-7e5c8cd6a6d2	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	Учеба	2026-05-09 20:51:21.133255	2026-05-09 20:51:21.133255	#DBEAFE
e80e150d-55d1-4e1c-9b83-7f5ca0d25db4	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	gfdg	2026-05-11 12:51:01.481149	2026-05-11 12:51:01.481149	#DCFCE7
4510db58-8f05-4ce3-960e-cbf6f2bdf109	ecd9c10c-319e-4bd2-b852-7dbaa2bccafb	hgjghjgh	2026-05-11 23:23:24.086326	2026-05-11 23:23:24.086326	#FEE2E2
057e8501-9f13-4e77-a5cf-0d2693e0a3d1	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	пук пук	2026-05-13 00:52:44.048905	2026-05-13 00:52:44.048905	#CCFBF1
acdc2ce8-a14b-42fb-8f98-e8cdc0eb07fb	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	ап	2026-05-14 23:58:47.201277	2026-05-14 23:58:47.201277	#E6F8FA
\.


--
-- TOC entry 5236 (class 0 OID 57696)
-- Dependencies: 233
-- Data for Name: task_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_history (id, task_id, old_status, new_status, changed_at) FROM stdin;
0f1e8e6f-49db-4ac7-860a-ed19c8eda355	21ddad82-9afd-4198-9548-4564fdf192e4	in_progress	completed	2026-05-14 22:35:22.856835
d684f75c-c469-446a-9700-8764a71113be	1169e842-eb12-4efe-a9c0-9f9fa573b924	new	completed	2026-05-13 00:53:00.553541
8015a9f7-aa47-421b-a91d-dd228ae6a00c	1169e842-eb12-4efe-a9c0-9f9fa573b924	completed	in_progress	2026-05-13 00:53:01.233267
b774b79d-26c0-414f-8269-0ef81689a236	1169e842-eb12-4efe-a9c0-9f9fa573b924	in_progress	completed	2026-05-13 01:05:02.144255
ed87953e-27b9-48d0-8e6c-1d8f42fedf43	077b38c4-b31c-4d9f-8bef-de6751e15375	new	completed	2026-05-14 15:19:02.626358
42d31283-023a-4c74-afcd-2263df1f8756	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 15:19:03.199075
2a53ca82-fe71-4d1f-a728-eff7246a7dad	077b38c4-b31c-4d9f-8bef-de6751e15375	in_progress	completed	2026-05-14 15:19:03.323775
ad2c65a2-5a21-484f-9f3e-4d9fcbe0d31f	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 15:19:04.073904
a9921b87-7363-4279-a661-b7f6f7ce28da	077b38c4-b31c-4d9f-8bef-de6751e15375	in_progress	completed	2026-05-14 15:19:04.493695
35ade595-4112-4dcf-b95f-3866dc116e93	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 15:19:05.530888
4620995c-84d6-4a54-b992-5f1f7fcfcc49	077b38c4-b31c-4d9f-8bef-de6751e15375	in_progress	completed	2026-05-14 15:19:05.958108
39cfe53e-1865-44da-b9a6-20fb1cafcb5e	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 15:19:06.481068
24d1773a-d171-4705-88e3-589090c29e03	21ddad82-9afd-4198-9548-4564fdf192e4	new	completed	2026-05-14 15:29:48.748665
10b499cb-a1b7-488d-ab2a-8513bda71e69	21ddad82-9afd-4198-9548-4564fdf192e4	completed	in_progress	2026-05-14 15:29:49.590643
c1951dbc-2ab4-4567-b7ef-a7bd9df684cf	21ddad82-9afd-4198-9548-4564fdf192e4	in_progress	completed	2026-05-14 15:51:56.377333
a9f2e3c7-88f6-4685-90ff-606dee2482ed	077b38c4-b31c-4d9f-8bef-de6751e15375	in_progress	completed	2026-05-14 15:51:56.949889
c8955124-c66a-4a3d-b6cf-cdec62721dd2	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 15:51:57.381485
1b5688aa-8d7c-4b53-a584-961914fc2c1d	21ddad82-9afd-4198-9548-4564fdf192e4	completed	in_progress	2026-05-14 15:51:57.719996
4850c525-96ef-4228-928f-7eaedf64766a	1169e842-eb12-4efe-a9c0-9f9fa573b924	completed	in_progress	2026-05-14 15:51:58.715598
fa4479cb-f204-43f4-8d55-f6ac8c566418	077b38c4-b31c-4d9f-8bef-de6751e15375	in_progress	completed	2026-05-14 16:04:40.947355
0e5df54c-cad9-4f0a-8fb5-c22bd3080e13	077b38c4-b31c-4d9f-8bef-de6751e15375	completed	in_progress	2026-05-14 16:04:41.816351
\.


--
-- TOC entry 5225 (class 0 OID 57505)
-- Dependencies: 222
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, user_id, category_id, title, description, task_type, status, priority, start_datetime, end_datetime, is_premium, created_at, updated_at, group_id, micro_step) FROM stdin;
41b73fda-092d-42c5-9388-c2a600c7a060	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	Тренировкавааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааа		regular	planned	medium	\N	\N	f	2026-05-12 23:30:49.280232	2026-05-12 23:30:49.280232	\N	\N
496db439-5cea-48f6-af60-b89ae8a9397f	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	5	Тренировка		regular	planned	medium	\N	\N	f	2026-05-12 23:31:02.180912	2026-05-12 23:31:02.180912	\N	\N
077b38c4-b31c-4d9f-8bef-de6751e15375	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	написать диплом	бла бла\nбла бла	regular	in_progress	high	2026-05-13 12:00:00	\N	f	2026-05-13 01:05:41.149664	2026-05-14 16:04:41.816351	\N	открыть сайт
21ddad82-9afd-4198-9548-4564fdf192e4	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	ываыва	ыва	regular	completed	medium	2026-05-14 12:00:00	\N	f	2026-05-14 15:27:41.210912	2026-05-14 22:35:22.856835	\N	выа
1169e842-eb12-4efe-a9c0-9f9fa573b924	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	1	вава	ываыва	regular	in_progress	high	2026-05-13 04:56:00	\N	f	2026-05-13 00:52:28.758442	2026-05-14 23:29:03.152817	\N	ываываыв
\.


--
-- TOC entry 5242 (class 0 OID 81969)
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
\.


--
-- TOC entry 5241 (class 0 OID 81938)
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
\.


--
-- TOC entry 5244 (class 0 OID 90143)
-- Dependencies: 241
-- Data for Name: user_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_exercises (id, user_id, name, description, difficulty, equipment, is_premium, measure_type, measure_units, group_id, created_at) FROM stdin;
72dfcf1e-5b0c-46b8-aec7-d9956976b4ca	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	Жим	\N	Средняя	\N	f	weight_reps	["kg", "min"]	4eec3179-6391-4108-ac6f-871f07dc0e89	2026-05-19 11:02:06.718555
8d7ffd04-b697-4556-87de-49e110175edd	93ab140f-e796-40d9-99ae-76a4b954ec20	яячяччсячс	\N	Средняя	\N	f	distance_time	["kg", "km", "reps", "min"]	d2b0818a-8dee-437e-a679-8311e9abc050	2026-05-19 11:07:08.205856
17bc7229-d3e1-477f-b924-2e7e1422b198	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	ФЫВАФЫВА	\N	Средняя	\N	f	weight_reps	["kg"]	71688562-1467-46b7-a026-88cf6b8b36ed	2026-05-19 11:12:02.75541
\.


--
-- TOC entry 5240 (class 0 OID 73822)
-- Dependencies: 237
-- Data for Name: user_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_subscriptions (id, user_id, plan_id, status, started_at, expires_at, created_at, updated_at) FROM stdin;
fe6e3079-7619-4763-89c7-e61330056bb6	27da5183-101e-4e2a-a0b2-22bcf9ef8e37	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-12 21:15:22.991089	\N	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
59be3e35-1d7d-4c76-83ef-00bb74b6daad	6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-12 22:03:49.693618	\N	2026-05-12 22:03:49.693618	2026-05-12 22:03:49.693618
1695e658-66fd-4cd6-ae15-0f8fabe2d10b	93ab140f-e796-40d9-99ae-76a4b954ec20	fe75751b-749e-4b57-936f-94989e2cec2b	active	2026-05-19 11:02:50.826389	\N	2026-05-19 11:02:50.826389	2026-05-19 11:02:50.826389
\.


--
-- TOC entry 5238 (class 0 OID 73762)
-- Dependencies: 235
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, is_guest, avatar_url, created_at, updated_at) FROM stdin;
27da5183-101e-4e2a-a0b2-22bcf9ef8e37	demo_user	demo@sunday.local	temporary_hash_change_after_auth_setup	user	f	\N	2026-05-12 21:15:22.991089	2026-05-12 21:15:22.991089
6e78b7b9-63de-4452-a4d9-c3a4e68e1ffa	z_666_z	dinar190100@gmail.com	$2b$10$.VR1MKTveuH/.LKgp.5EkOQwB2nE.Vl0EDN6Ng83XmDJ8bx1HEYwK	user	f	\N	2026-05-12 22:03:49.693618	2026-05-12 22:03:49.693618
93ab140f-e796-40d9-99ae-76a4b954ec20	zxc	zcx@zxc	$2b$10$K3ljw88FRm2FMgGpPmzw7uRKSKKyYzCGmpUL0968uzKVx.2SG6S02	user	f	\N	2026-05-19 11:02:50.826389	2026-05-19 11:02:50.826389
\.


--
-- TOC entry 5234 (class 0 OID 57642)
-- Dependencies: 231
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_exercises (id, workout_id, exercise_id, sets_count, reps_count, weight_kg, exercise_order, notes, is_completed) FROM stdin;
a0cf9eec-8d09-4893-9d32-abafc8703afe	b49c688d-b047-423a-a5b7-2898c8472c22	57	3	10	\N	1	\N	f
83431870-eb51-409f-9696-c7a7946af187	74f3cf9a-e684-4103-9778-fb5faf807547	74	3	10	\N	1	\N	f
3ffa4998-95d9-4667-b7e3-87bd7e2da4da	74f3cf9a-e684-4103-9778-fb5faf807547	76	3	10	\N	1	\N	f
d76341bc-efe0-4c48-bbf4-c50c2b57cc00	74f3cf9a-e684-4103-9778-fb5faf807547	44	3	10	\N	1	\N	f
412a7722-21c7-40d6-8877-dd9b6c17293e	74f3cf9a-e684-4103-9778-fb5faf807547	77	3	10	\N	1	\N	f
\.


--
-- TOC entry 5233 (class 0 OID 57615)
-- Dependencies: 230
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workouts (id, task_id, main_muscle_group_id, duration_minutes, notes, created_at, updated_at, repeat_days) FROM stdin;
b49c688d-b047-423a-a5b7-2898c8472c22	41b73fda-092d-42c5-9388-c2a600c7a060	5	\N	\N	2026-05-12 23:30:49.280232	2026-05-12 23:30:49.280232	{ЧТ}
74f3cf9a-e684-4103-9778-fb5faf807547	496db439-5cea-48f6-af60-b89ae8a9397f	8	\N	\N	2026-05-12 23:31:02.180912	2026-05-12 23:31:02.180912	{ЧТ,ВТ}
\.


--
-- TOC entry 5265 (class 0 OID 0)
-- Dependencies: 225
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_id_seq', 100, true);


--
-- TOC entry 5266 (class 0 OID 0)
-- Dependencies: 228
-- Name: muscle_group_combinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscle_group_combinations_id_seq', 9, true);


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 223
-- Name: muscle_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.muscle_groups_id_seq', 11, true);


--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 220
-- Name: task_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_categories_id_seq', 5, true);


--
-- TOC entry 5004 (class 2606 OID 57685)
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 90130)
-- Name: exercise_groups exercise_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 90132)
-- Name: exercise_groups exercise_groups_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_user_id_name_key UNIQUE (user_id, name);


--
-- TOC entry 4989 (class 2606 OID 57579)
-- Name: exercise_muscle_groups exercise_muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_pkey PRIMARY KEY (exercise_id, muscle_group_id);


--
-- TOC entry 4985 (class 2606 OID 57570)
-- Name: exercises exercises_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_name_key UNIQUE (name);


--
-- TOC entry 4987 (class 2606 OID 57568)
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 4992 (class 2606 OID 57602)
-- Name: muscle_group_combinations muscle_group_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 57551)
-- Name: muscle_groups muscle_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_name_key UNIQUE (name);


--
-- TOC entry 4983 (class 2606 OID 57549)
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 73821)
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- TOC entry 5025 (class 2606 OID 73819)
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- TOC entry 5027 (class 2606 OID 73817)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 57504)
-- Name: task_categories task_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories
    ADD CONSTRAINT task_categories_name_key UNIQUE (name);


--
-- TOC entry 4970 (class 2606 OID 57502)
-- Name: task_categories task_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_categories
    ADD CONSTRAINT task_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 65552)
-- Name: task_groups task_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_groups
    ADD CONSTRAINT task_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 57706)
-- Name: task_history task_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 57528)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 57604)
-- Name: muscle_group_combinations unique_muscle_combination; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT unique_muscle_combination UNIQUE (main_muscle_group_id, recommended_muscle_group_id);


--
-- TOC entry 5013 (class 2606 OID 65554)
-- Name: task_groups unique_task_group_per_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_groups
    ADD CONSTRAINT unique_task_group_per_user UNIQUE (user_id, name);


--
-- TOC entry 5039 (class 2606 OID 81981)
-- Name: user_exercise_metric_history user_exercise_metric_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 81958)
-- Name: user_exercise_metrics user_exercise_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 5045 (class 2606 OID 90162)
-- Name: user_exercises user_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 90164)
-- Name: user_exercises user_exercises_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_user_id_name_key UNIQUE (user_id, name);


--
-- TOC entry 5031 (class 2606 OID 73839)
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 73786)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5019 (class 2606 OID 73782)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 73784)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5002 (class 2606 OID 57657)
-- Name: workout_exercises workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 57629)
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 57631)
-- Name: workouts workouts_task_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_task_id_key UNIQUE (task_id);


--
-- TOC entry 5005 (class 1259 OID 57719)
-- Name: idx_calendar_events_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_start_datetime ON public.calendar_events USING btree (start_datetime);


--
-- TOC entry 5006 (class 1259 OID 57718)
-- Name: idx_calendar_events_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events USING btree (user_id);


--
-- TOC entry 4990 (class 1259 OID 57722)
-- Name: idx_exercise_muscle_groups_muscle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_exercise_muscle_groups_muscle ON public.exercise_muscle_groups USING btree (muscle_group_id);


--
-- TOC entry 5009 (class 1259 OID 65565)
-- Name: idx_task_groups_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_groups_user_id ON public.task_groups USING btree (user_id);


--
-- TOC entry 4971 (class 1259 OID 57713)
-- Name: idx_tasks_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_category_id ON public.tasks USING btree (category_id);


--
-- TOC entry 4972 (class 1259 OID 65566)
-- Name: idx_tasks_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_group_id ON public.tasks USING btree (group_id);


--
-- TOC entry 4973 (class 1259 OID 57715)
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- TOC entry 4974 (class 1259 OID 57716)
-- Name: idx_tasks_start_datetime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_start_datetime ON public.tasks USING btree (start_datetime);


--
-- TOC entry 4975 (class 1259 OID 57714)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 4976 (class 1259 OID 57717)
-- Name: idx_tasks_task_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_task_type ON public.tasks USING btree (task_type);


--
-- TOC entry 4977 (class 1259 OID 57712)
-- Name: idx_tasks_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);


--
-- TOC entry 5036 (class 1259 OID 81994)
-- Name: idx_user_exercise_metric_history_metric_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metric_history_metric_id ON public.user_exercise_metric_history USING btree (metric_id);


--
-- TOC entry 5037 (class 1259 OID 81995)
-- Name: idx_user_exercise_metric_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metric_history_user_id ON public.user_exercise_metric_history USING btree (user_id);


--
-- TOC entry 5032 (class 1259 OID 81993)
-- Name: idx_user_exercise_metrics_exercise_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metrics_exercise_id ON public.user_exercise_metrics USING btree (exercise_id);


--
-- TOC entry 5033 (class 1259 OID 81992)
-- Name: idx_user_exercise_metrics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_exercise_metrics_user_id ON public.user_exercise_metrics USING btree (user_id);


--
-- TOC entry 5028 (class 1259 OID 73853)
-- Name: idx_user_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);


--
-- TOC entry 5029 (class 1259 OID 73852)
-- Name: idx_user_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);


--
-- TOC entry 5014 (class 1259 OID 73850)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5015 (class 1259 OID 73851)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 4995 (class 1259 OID 57721)
-- Name: idx_workouts_main_muscle_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_main_muscle_group_id ON public.workouts USING btree (main_muscle_group_id);


--
-- TOC entry 4996 (class 1259 OID 57720)
-- Name: idx_workouts_task_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_task_id ON public.workouts USING btree (task_id);


--
-- TOC entry 5074 (class 2620 OID 57727)
-- Name: calendar_events trg_calendar_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5075 (class 2620 OID 65567)
-- Name: task_groups trg_task_groups_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_task_groups_updated_at BEFORE UPDATE ON public.task_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5071 (class 2620 OID 57729)
-- Name: tasks trg_task_status_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_task_status_history AFTER UPDATE OF status ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.save_task_status_history();


--
-- TOC entry 5072 (class 2620 OID 57725)
-- Name: tasks trg_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5073 (class 2620 OID 57726)
-- Name: workouts trg_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5060 (class 2606 OID 57691)
-- Name: calendar_events calendar_events_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 90133)
-- Name: exercise_groups exercise_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_groups
    ADD CONSTRAINT exercise_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5052 (class 2606 OID 57580)
-- Name: exercise_muscle_groups exercise_muscle_groups_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 57585)
-- Name: exercise_muscle_groups exercise_muscle_groups_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_muscle_groups
    ADD CONSTRAINT exercise_muscle_groups_muscle_group_id_fkey FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 90138)
-- Name: exercises exercises_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.exercise_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5054 (class 2606 OID 57605)
-- Name: muscle_group_combinations muscle_group_combinations_main_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_main_muscle_group_id_fkey FOREIGN KEY (main_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5055 (class 2606 OID 57610)
-- Name: muscle_group_combinations muscle_group_combinations_recommended_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.muscle_group_combinations
    ADD CONSTRAINT muscle_group_combinations_recommended_muscle_group_id_fkey FOREIGN KEY (recommended_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 57707)
-- Name: task_history task_history_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_history
    ADD CONSTRAINT task_history_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5048 (class 2606 OID 57534)
-- Name: tasks tasks_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.task_categories(id) ON DELETE SET NULL;


--
-- TOC entry 5049 (class 2606 OID 65560)
-- Name: tasks tasks_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.task_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5050 (class 2606 OID 73854)
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 81982)
-- Name: user_exercise_metric_history user_exercise_metric_history_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.user_exercise_metrics(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 81987)
-- Name: user_exercise_metric_history user_exercise_metric_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metric_history
    ADD CONSTRAINT user_exercise_metric_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5064 (class 2606 OID 81964)
-- Name: user_exercise_metrics user_exercise_metrics_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE SET NULL;


--
-- TOC entry 5065 (class 2606 OID 81959)
-- Name: user_exercise_metrics user_exercise_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercise_metrics
    ADD CONSTRAINT user_exercise_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5069 (class 2606 OID 90170)
-- Name: user_exercises user_exercises_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.exercise_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5070 (class 2606 OID 90165)
-- Name: user_exercises user_exercises_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_exercises
    ADD CONSTRAINT user_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 73845)
-- Name: user_subscriptions user_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- TOC entry 5063 (class 2606 OID 73840)
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5058 (class 2606 OID 57663)
-- Name: workout_exercises workout_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE RESTRICT;


--
-- TOC entry 5059 (class 2606 OID 57658)
-- Name: workout_exercises workout_exercises_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 57637)
-- Name: workouts workouts_main_muscle_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_main_muscle_group_id_fkey FOREIGN KEY (main_muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE SET NULL;


--
-- TOC entry 5057 (class 2606 OID 57632)
-- Name: workouts workouts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


-- Completed on 2026-05-19 11:13:32

--
-- PostgreSQL database dump complete
--

\unrestrict C0du1SPtm9l064dsxRbmUn4MEi2pCg1ia9Vdwmfiq5qhwh8LLh5ANJB7pcGvUup

