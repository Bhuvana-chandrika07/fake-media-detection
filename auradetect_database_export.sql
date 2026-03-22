--
-- PostgreSQL database dump
--

\restrict cJKoDjxXIWFgpHnFt2ewxXLunWMmxHcJaQPVjhB0M65R4lnZP9kq3rruDl1695n

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scans (
    id integer NOT NULL,
    prediction text NOT NULL,
    confidence real NOT NULL,
    explanation text NOT NULL,
    media_type text NOT NULL,
    filename text NOT NULL,
    file_size integer,
    analysis_details jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: scans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scans_id_seq OWNED BY public.scans.id;


--
-- Name: scans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scans ALTER COLUMN id SET DEFAULT nextval('public.scans_id_seq'::regclass);


--
-- Data for Name: scans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scans (id, prediction, confidence, explanation, media_type, filename, file_size, analysis_details, created_at) FROM stdin;
1	Fake	0.7272	SVM+RF ensemble detected deepfake artifacts with 72% confidence. HOG feature analysis revealed inconsistencies in facial texture gradients. Frequency domain anomalies and noise patterns match GAN-generated signatures.	image	easy_10_0001.jpg	100578	{"noisePattern": 0.76, "processingTime": 166, "frequencyAnomaly": 0.642, "facialInconsistency": 0.813, "compressionArtifacts": 0.923}	2026-03-13 15:25:41.145714
2	Fake	0.6359	SVM+RF ensemble detected deepfake artifacts with 63% confidence. HOG feature analysis revealed inconsistencies in facial texture gradients. Frequency domain anomalies and noise patterns match GAN-generated signatures.	image	gals-on-leaves-caused-by-pest-species-aceria-erinea-mite.webp	36618	{"noisePattern": 0.832, "processingTime": 1086, "frequencyAnomaly": 0.709, "facialInconsistency": 0.703, "compressionArtifacts": 0.476}	2026-03-13 15:30:37.572326
3	Fake	0.5336	SVM+RF ensemble detected deepfake artifacts with 53% confidence. HOG feature analysis revealed inconsistencies in facial texture gradients. Frequency domain anomalies and noise patterns match GAN-generated signatures.	image	ChatGPT Image Dec 17, 2025, 09_04_46 PM.png	465940	{"noisePattern": 0.405, "processingTime": 993, "frequencyAnomaly": 0.514, "facialInconsistency": 0.595, "compressionArtifacts": 0.666}	2026-03-14 16:33:01.767737
\.


--
-- Name: scans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scans_id_seq', 3, true);


--
-- Name: scans scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict cJKoDjxXIWFgpHnFt2ewxXLunWMmxHcJaQPVjhB0M65R4lnZP9kq3rruDl1695n

