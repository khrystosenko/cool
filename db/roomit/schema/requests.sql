CREATE TABLE requests (
  `user_id` INT(10) UNSIGNED DEFAULT NULL, 	
  `ip` INT(10) UNSIGNED NOT NULL,
  `path` VARCHAR(32) NOT NULL,
  `ts` INT(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
