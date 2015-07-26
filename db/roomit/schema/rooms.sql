CREATE TABLE rooms (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `service` VARCHAR(32) NOT NULL,
  `channel` VARCHAR(128) NOT NULL,
  `name` VARCHAR(36) NOT NULL,
  `exp_time` INT(10) UNSIGNED NOT NULL,
  UNIQUE(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

