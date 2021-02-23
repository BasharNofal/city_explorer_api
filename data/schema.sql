DROP TABLE IF EXISTS city_location;

CREATE TABLE IF NOT EXISTS
city_location(
    city_name VARCHAR(256) NOT NULL,
    longitude VARCHAR(256) NOT NULL,
    latitude VARCHAR(256) NOT NULL
);