CREATE TABLE `call_logs` ( `id` INT(11) NOT NULL AUTO_INCREMENT, `channel_name` VARCHAR(255), `slug` VARCHAR(33), `created_at` TIMESTAMP, `updated_at` DATETIME, `deleted_at` DATETIME, PRIMARY KEY (`id`) ); 

CREATE TABLE `call_log_users` ( `id` INT(11) NOT NULL AUTO_INCREMENT, `user_id` INT(11) DEFAULT 0, `reason` VARCHAR(255), `start_call_time` DATETIME, `end_call_time` DATETIME, `duration` VARCHAR(33), `user_uid` VARCHAR(33), `is_left_call` TINYINT(3) DEFAULT 0, `created_at` TIMESTAMP, `updated_at` DATETIME, `deleted_at` DATETIME, PRIMARY KEY (`id`) );

ALTER TABLE `users` ADD `on_call` VARCHAR(33) NULL DEFAULT NULL AFTER `status`;

ALTER TABLE `call_log_users` ADD COLUMN `call_type` TINYINT(3) DEFAULT 0 NULL AFTER `user_uid`, ADD COLUMN `call_status` VARCHAR(33) DEFAULT 'miss_call' NULL AFTER `call_type`, CHANGE `is_left_call` `user_status` TINYINT(3) DEFAULT 0 NULL; 

ALTER TABLE `call_logs` ADD COLUMN `channel_type` VARCHAR(33) DEFAULT 'single' NULL AFTER `id`;