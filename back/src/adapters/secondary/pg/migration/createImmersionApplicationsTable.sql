CREATE TABLE public.immersion_applications (
    id uuid PRIMARY KEY,
    status varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    phone varchar(255),
    agency_code varchar(255), -- TODO: remove once replaced by agency_id.
    agency_id uuid, -- TODO: make NOT NULL once it replaced agency_code.
    date_submission timestamp without time zone NOT NULL,
    date_start timestamp without time zone NOT NULL,
    date_end timestamp without time zone NOT NULL,
    siret char(14) NOT NULL,
    business_name varchar(255) NOT NULL,
    mentor varchar(255) NOT NULL,
    mentor_phone varchar(255) NOT NULL,
    mentor_email varchar(255) NOT NULL,
    schedule jsonb NOT NULL,
    individual_protection boolean NOT NULL,
    sanitary_prevention boolean NOT NULL,
    sanitary_prevention_description varchar(255),
    immersion_address varchar(255),
    immersion_objective varchar(255),
    immersion_profession varchar(255) NOT NULL,
    immersion_activities varchar(255) NOT NULL,
    immersion_skills varchar(255),
    beneficiary_accepted boolean NOT NULL,
    enterprise_accepted boolean NOT NULL
);
