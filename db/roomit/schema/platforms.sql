CREATE TABLE platforms (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(64) NOT NULL,
  UNIQUE(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;