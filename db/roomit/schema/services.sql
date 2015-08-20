CREATE TABLE services (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(64) NOT NULL,
  `logo` VARCHAR(128),
  UNIQUE(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;