CREATE SEQUENCE IF NOT EXISTS public.mesh_logs_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_logs_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_logs
(
    id bigint NOT NULL DEFAULT nextval('mesh_logs_id_seq'::regclass),
    team_id bigint NOT NULL,
    server_id bigint,
    script_id bigint,
    user_id bigint,
    level character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Info'::character varying,
    source character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'System'::character varying,
    code integer,
    time integer,
    output jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_logs_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_logs
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_team_id
    ON public.mesh_logs USING btree
    (team_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_server_id
    ON public.mesh_logs USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_script_id
    ON public.mesh_logs USING btree
    (script_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_level
    ON public.mesh_logs USING btree
    (level COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_source
    ON public.mesh_logs USING btree
    (source COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_created_at
    ON public.mesh_logs USING btree
    (created_at DESC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
