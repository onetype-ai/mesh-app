CREATE SEQUENCE IF NOT EXISTS public.mesh_packages_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_packages_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_packages
(
    id bigint NOT NULL DEFAULT nextval('mesh_packages_id_seq'::regclass),
    team_id bigint NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    overview text COLLATE pg_catalog."default",
    version character varying(50) COLLATE pg_catalog."default",
    script_install_id bigint,
    script_uninstall_id bigint,
    script_status_id bigint,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    installed_condition text COLLATE pg_catalog."default",
    platforms character varying(50)[] COLLATE pg_catalog."default" NOT NULL DEFAULT '{*}'::character varying[],
    is_marketplace boolean NOT NULL DEFAULT false,
    is_global boolean NOT NULL DEFAULT false,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Draft'::character varying,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_packages_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_packages
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_packages_team_id
    ON public.mesh_packages USING btree
    (team_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
