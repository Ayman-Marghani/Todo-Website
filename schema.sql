CREATE TABLE Todo (
  id INT NOT NULL auto_increment,
  title VARCHAR(200) NOT NULL,
  done BOOLEAN DEFAULT false,
  deadline DATE,
  PRIMARY KEY (id)
);