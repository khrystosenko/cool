CREATE TABLE user_sessions (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `session` VARCHAR(256) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `exp_time` INT(10) UNSIGNED NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX session_index (`session`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
