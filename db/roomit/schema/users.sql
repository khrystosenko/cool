CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(255) NOT NULL,
	password VARCHAR(64) NOT NULL,
	first_name VARCHAR(64),
	last_name VARCHAR(64),
	email VARCHAR(255) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (username),
	UNIQUE (email)
);