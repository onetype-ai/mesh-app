-- Sequence: public.mesh_scripts_id_seq

-- DROP SEQUENCE IF EXISTS public.mesh_scripts_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.mesh_scripts_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_scripts_id_seq
    OWNER TO onetype;

-- Table: public.mesh_scripts

-- DROP TABLE IF EXISTS public.mesh_scripts;

CREATE TABLE IF NOT EXISTS public.mesh_scripts
(
    id bigint NOT NULL DEFAULT nextval('mesh_scripts_id_seq'::regclass),
    team_id bigint NOT NULL,
    service_id bigint,
    server_id bigint,
    package_id bigint,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    platforms character varying(50)[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{*}'::character varying[],
    is_marketplace boolean NOT NULL DEFAULT false,
    is_verified boolean NOT NULL DEFAULT false,
    is_global boolean NOT NULL DEFAULT false,
    autorun boolean NOT NULL DEFAULT false,
    loop bigint,
    output character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'raw'::character varying,
    bash text COLLATE pg_catalog."default" NOT NULL,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Draft'::character varying,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_scripts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_scripts
    OWNER to onetype;

-- Index: idx_mesh_scripts_team_id

-- DROP INDEX IF EXISTS public.idx_mesh_scripts_team_id;

CREATE INDEX IF NOT EXISTS idx_mesh_scripts_team_id
    ON public.mesh_scripts USING btree
    (team_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

-- Index: idx_mesh_scripts_service_id

-- DROP INDEX IF EXISTS public.idx_mesh_scripts_service_id;

CREATE INDEX IF NOT EXISTS idx_mesh_scripts_service_id
    ON public.mesh_scripts USING btree
    (service_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

-- Index: idx_mesh_scripts_server_id

-- DROP INDEX IF EXISTS public.idx_mesh_scripts_server_id;

CREATE INDEX IF NOT EXISTS idx_mesh_scripts_server_id
    ON public.mesh_scripts USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
