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

-- ===== Join: servers ↔ scripts =====

CREATE SEQUENCE IF NOT EXISTS public.mesh_servers_scripts_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_servers_scripts_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_servers_scripts
(
    id bigint NOT NULL DEFAULT nextval('mesh_servers_scripts_id_seq'::regclass),
    team_id bigint NOT NULL,
    server_id bigint NOT NULL,
    script_id bigint NOT NULL,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_servers_scripts_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_servers_scripts
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_scripts_server_id
    ON public.mesh_servers_scripts USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_scripts_script_id
    ON public.mesh_servers_scripts USING btree
    (script_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

-- ===== Join: servers ↔ packages =====

CREATE SEQUENCE IF NOT EXISTS public.mesh_servers_packages_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_servers_packages_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_servers_packages
(
    id bigint NOT NULL DEFAULT nextval('mesh_servers_packages_id_seq'::regclass),
    team_id bigint NOT NULL,
    server_id bigint NOT NULL,
    package_id bigint NOT NULL,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_servers_packages_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_servers_packages
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_packages_server_id
    ON public.mesh_servers_packages USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_packages_package_id
    ON public.mesh_servers_packages USING btree
    (package_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

-- ===== Join: servers ↔ services =====

CREATE SEQUENCE IF NOT EXISTS public.mesh_servers_services_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_servers_services_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_servers_services
(
    id bigint NOT NULL DEFAULT nextval('mesh_servers_services_id_seq'::regclass),
    team_id bigint NOT NULL,
    server_id bigint NOT NULL,
    service_id bigint NOT NULL,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_servers_services_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_servers_services
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_services_server_id
    ON public.mesh_servers_services USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_servers_services_service_id
    ON public.mesh_servers_services USING btree
    (service_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

