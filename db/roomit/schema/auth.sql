CREATE TABLE auth (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `provider_id` INT UNSIGNED NOT NULL,
  `hash` VARCHAR(256) NOT NULL,

  FOREIGN KEY (provider_id) REFERENCES auth_providers(id),
  INDEX hash_index (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
