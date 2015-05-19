CREATE TABLE rooms (
  `link` VARCHAR(255) NOT NULL,
  `room_uuid` VARCHAR(36) NOT NULL,
  `exp_time` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`room_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

