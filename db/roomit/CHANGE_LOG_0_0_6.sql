CREATE TABLE games (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(128) NOT NULL,
  UNIQUE(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE services (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(64) NOT NULL,
  UNIQUE(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE streams (
    id INT NOT NULL AUTO_INCREMENT,
    service_id INT NOT NULL,
    game_id INT NOT NULL,
    channel_id VARCHAR(32) NOT NULL,

    online BOOLEAN NOT NULL,
    viewers INT NOT NULL,

    mature BOOLEAN NOT NULL,
    language VARCHAR(8) NOT NULL,
    display_name VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    preview VARCHAR(256) DEFAULT NULL,
    logo VARCHAR(256) DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE(service_id, channel_id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (game_id) REFERENCES games(id),

    INDEX service_index (service_id),
    INDEX game_index (game_id),
    INDEX display_name_index (display_name),
    INDEX name_index (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;