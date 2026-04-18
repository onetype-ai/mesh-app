CREATE SEQUENCE IF NOT EXISTS public.mesh_approvals_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_approvals_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_approvals
(
    id bigint NOT NULL DEFAULT nextval('mesh_approvals_id_seq'::regclass),
    team_id bigint NOT NULL,
    server_id bigint,
    script_id bigint NOT NULL,
    user_id bigint,
    hash character varying(128) COLLATE pg_catalog."default" NOT NULL,
    is_approved boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_approvals_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_approvals
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_approvals_team_id
    ON public.mesh_approvals USING btree
    (team_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_approvals_server_id
    ON public.mesh_approvals USING btree
    (server_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_approvals_script_id
    ON public.mesh_approvals USING btree
    (script_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_mesh_approvals_hash
    ON public.mesh_approvals USING btree
    (hash COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
