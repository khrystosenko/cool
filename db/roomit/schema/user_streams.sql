CREATE TABLE user_streams (
  `user_id` INT(10) UNSIGNED NOT NULL,
  `stream_id` INT(10) UNSIGNED NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stream_id) REFERENCES streams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
