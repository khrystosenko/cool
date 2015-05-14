CREATE TABLE user_sessions (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(10) NOT NULL,
  `session_id` VARCHAR(40) NOT NULL,
  `exp_time` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY `session_idx` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;