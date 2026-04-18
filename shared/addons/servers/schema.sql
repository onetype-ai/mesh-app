-- Sequence: public.mesh_servers_id_seq

-- DROP SEQUENCE IF EXISTS public.mesh_servers_id_seq;

CREATE SEQUENCE IF NOT EXISTS public.mesh_servers_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_servers_id_seq
    OWNER TO onetype;

-- Table: public.mesh_servers

-- DROP TABLE IF EXISTS public.mesh_servers;

CREATE TABLE IF NOT EXISTS public.mesh_servers
(
    id bigint NOT NULL DEFAULT nextval('mesh_servers_id_seq'::regclass),
    team_id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token character varying(255) COLLATE pg_catalog."default" NOT NULL,
    is_rented boolean NOT NULL DEFAULT false,
    marketplace_id bigint,
    scripts bigint[] NOT NULL DEFAULT '{}'::bigint[],
    packages bigint[] NOT NULL DEFAULT '{}'::bigint[],
    services bigint[] NOT NULL DEFAULT '{}'::bigint[],
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Inactive'::character varying,
    is_initialized boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_servers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_servers
    OWNER to onetype;

-- Index: idx_mesh_servers_team_id

-- DROP INDEX IF EXISTS public.idx_mesh_servers_team_id;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_team_id
    ON public.mesh_servers USING btree
    (team_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

-- Index: idx_mesh_servers_token

-- DROP INDEX IF EXISTS public.idx_mesh_servers_token;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mesh_servers_token
    ON public.mesh_servers USING btree
    (token COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

