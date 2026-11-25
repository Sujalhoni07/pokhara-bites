-- 001: users (customers + admin) and table reservations

CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(60)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE CHECK (email = lower(email)),
  phone         VARCHAR(10),
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE reservations (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code       VARCHAR(12)  NOT NULL UNIQUE,
  user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  name       VARCHAR(60)  NOT NULL,
  phone      VARCHAR(10)  NOT NULL,
  date       DATE         NOT NULL,
  time       TIME         NOT NULL,
  guests     SMALLINT     NOT NULL CHECK (guests BETWEEN 1 AND 20),
  note       VARCHAR(200) NOT NULL DEFAULT '',
  status     VARCHAR(20)  NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- "My Reservations" looks up by user, the dashboard filters by date
CREATE INDEX reservations_user_id_idx ON reservations (user_id);
CREATE INDEX reservations_date_idx    ON reservations (date);