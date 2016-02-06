CREATE TABLE streams (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    platform_id INT(10) UNSIGNED NOT NULL,
    game_id INT(10) UNSIGNED NOT NULL,
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
    UNIQUE(platform_id, channel_id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id),
    FOREIGN KEY (game_id) REFERENCES games(id),

    INDEX platform_index (`platform_id`, `viewers`, `online`),
    INDEX game_index (`game_id`, `viewers`, `online`),
    INDEX platform_game_index(`platform_id`, `game_id`, `viewers`, `online`),
    INDEX name_index (`display_name`, `name`, `viewers`, `online`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
