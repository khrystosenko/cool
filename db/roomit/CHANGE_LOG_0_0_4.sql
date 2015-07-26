ALTER TABLE `rooms` ADD COLUMN `name` VARCHAR(36) NOT NULL;
UPDATE `rooms` SET `name` = `id` WHERE `id`=`id`;
ALTER TABLE `rooms` ADD CONSTRAINT UNIQUE (name);