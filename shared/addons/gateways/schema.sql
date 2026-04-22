CREATE SEQUENCE IF NOT EXISTS public.mesh_gateways_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE IF EXISTS public.mesh_gateways_id_seq
    OWNER TO onetype;

CREATE TABLE IF NOT EXISTS public.mesh_gateways
(
    id bigint NOT NULL DEFAULT nextval('mesh_gateways_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    host character varying(255) COLLATE pg_catalog."default" NOT NULL,
    port integer NOT NULL DEFAULT 50000,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Active'::character varying,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT mesh_gateways_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mesh_gateways
    OWNER to onetype;

CREATE INDEX IF NOT EXISTS idx_mesh_gateways_status
    ON public.mesh_gateways USING btree
    (status COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
