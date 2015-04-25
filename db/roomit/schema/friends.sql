CREATE TABLE friends (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	friend_id INT NOT NULL,
	status ENUM('0', '1', '2'),
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (friend_id) REFERENCES users(id), 
	PRIMARY KEY (id)
);