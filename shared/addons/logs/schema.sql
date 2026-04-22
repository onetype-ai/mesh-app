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
    "user" jsonb,
    actor_ip varchar(64) COLLATE pg_catalog."default",
    actor_agent text COLLATE pg_catalog."default",
    correlation_id varchar(64) COLLATE pg_catalog."default",
    action varchar(128) COLLATE pg_catalog."default" NOT NULL,
    level varchar(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Info'::character varying,
    target_type varchar(50) COLLATE pg_catalog."default",
    target_id bigint,
    reference_type varchar(50) COLLATE pg_catalog."default",
    reference_id bigint,
    code integer,
    time integer,
    output jsonb NOT NULL DEFAULT '{}'::jsonb,
    hash varchar(64) COLLATE pg_catalog."default",
    hit_count integer NOT NULL DEFAULT 1,
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

CREATE INDEX IF NOT EXISTS idx_mesh_logs_correlation_id
    ON public.mesh_logs USING btree
    (correlation_id COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_action
    ON public.mesh_logs USING btree
    (action COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_level
    ON public.mesh_logs USING btree
    (level COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_target
    ON public.mesh_logs USING btree
    (target_type COLLATE pg_catalog."default" ASC NULLS LAST, target_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_reference
    ON public.mesh_logs USING btree
    (reference_type COLLATE pg_catalog."default" ASC NULLS LAST, reference_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_logs_created_at
    ON public.mesh_logs USING btree
    (created_at DESC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mesh_logs_dedup
    ON public.mesh_logs USING btree
    (team_id, hash)
    WHERE deleted_at IS NULL AND hash IS NOT NULL
    TABLESPACE pg_default;
