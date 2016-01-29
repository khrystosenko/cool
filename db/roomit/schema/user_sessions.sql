CREATE TABLE user_sessions (
  `session_hash` VARCHAR(32) NOT NULL,
  `user_id` INT(10) UNSIGNED NOT NULL,
  `exp_time` INT(10) NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX session_hash_index (`session_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
