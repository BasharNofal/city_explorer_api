DROP TABLE IF EXISTS city_location;

CREATE TABLE city_location(
    id SERIAL PRIMARY KEY NOT NULL,
    city_name VARCHAR(256) NOT NULL,
    longitude VARCHAR(256) NOT NULL,
    latitude VARCHAR(256) NOT NULL,
    formatted_query VARCHAR(256) NOT NULL
);