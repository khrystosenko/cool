CREATE TABLE feedbacks (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `text` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;