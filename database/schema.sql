CREATE TABLE booths (
    booth_id SERIAL PRIMARY KEY,
    booth_code VARCHAR(10) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL
);
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL UNIQUE,
    monthly_limit NUMERIC(12, 2) NOT NULL,
    revenue_rate NUMERIC(5, 4) NOT NULL
);
CREATE TABLE booth_services (
    booth_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,

    PRIMARY KEY (booth_id, service_id),

    FOREIGN KEY (booth_id)
        REFERENCES booths(booth_id)
        ON DELETE CASCADE,

    FOREIGN KEY (service_id)
        REFERENCES services(service_id)
        ON DELETE CASCADE
);
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,

    transaction_code VARCHAR(20) NOT NULL UNIQUE,

    booth_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,

    transaction_amount NUMERIC(12, 2) NOT NULL,

    tax_amount NUMERIC(12, 3),
    amount_after_tax NUMERIC(12, 3),

    revenue NUMERIC(12, 3) NOT NULL,

    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booth_id)
    REFERENCES booths(booth_id),

    FOREIGN KEY (service_id)
    REFERENCES services(service_id),

    CHECK (transaction_amount > 0),
    CHECK (revenue >= 0)
);