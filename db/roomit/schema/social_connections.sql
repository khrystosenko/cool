CREATE TABLE social_connections (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(10) UNSIGNED NOT NULL,
  `social_network_id` INT(2) UNSIGNED NOT NULL,
  `social_user_id` VARCHAR(32) NOT NULL,
  `access_token` TEXT NOT NULL,
  `expires` INT(10) NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (social_network_id) REFERENCES social_networks(id),
  UNIQUE KEY social_user_key (`user_id`, `social_network_id`, `social_user_id`),
  UNIQUE KEY social_key (`social_network_id`, `social_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
