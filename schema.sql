CREATE TABLE Todo (
  id INT NOT NULL auto_increment,
  title VARCHAR(200) NOT NULL,
  done BOOLEAN DEFAULT false,
  deadline DATE,
  userId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE Users (
  id INT NOT NULL auto_increment,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(300) NOT NULL,
  PRIMARY KEY (id)
);