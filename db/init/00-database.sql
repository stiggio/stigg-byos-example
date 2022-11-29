CREATE TABLE public.customers
(
    created_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    customer_id  VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    name         TEXT,
    email        TEXT,
    billing_id   VARCHAR(255),
    entitlements JSON         NOT NULL DEFAULT '[]'::JSON
);

COMMENT
ON TABLE public.customers IS 'Customer records.';

comment on column public.customers.entitlements is E'@overrideType Entitlement[]';

CREATE TABLE public.subscriptions
(
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_id   VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    customer_id       VARCHAR(255) NOT NULL REFERENCES public.customers (customer_id),
    status            VARCHAR(255) NOT NULL,
    plan_id           VARCHAR(255) NOT NULL,
    plan_name         TEXT         NOT NULL,
    billing_id        VARCHAR(255),
    start_date        TIMESTAMP    NOT NULL,
    end_date          TIMESTAMP,
    cancellation_date TIMESTAMP,
    trial_end_date    TIMESTAMP
);

COMMENT
ON TABLE public.subscriptions IS 'Subscription records.';