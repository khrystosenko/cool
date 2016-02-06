CREATE TABLE rooms (
  `user_id` INT(10) UNSIGNED NOT NULL,
  `name` VARCHAR(32) NOT NULL,

  UNIQUE(user_id),
  UNIQUE(name),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
