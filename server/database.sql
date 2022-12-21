create TABLE users(
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  age VARCHAR(50),
  city VARCHAR(50),
  create_date VARCHAR(100)
);

create TABLE admin(
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
);

create TABLE hostel(
  id SERIAL PRIMARY KEY,
  title VARCHAR(250),
  desc VARCHAR(250),
  discount VARCHAR(250),
  home_url VARCHAR(250),
  logo VARCHAR(250)
);

create TABLE cafe(
  id SERIAL PRIMARY KEY,
  title VARCHAR(250),
  desc VARCHAR(250),
  discount VARCHAR(250),
  home_url VARCHAR(250),
  logo VARCHAR(250)
);

create TABLE culture(
  id SERIAL PRIMARY KEY,
  title VARCHAR(250),
  desc VARCHAR(250),
  discount VARCHAR(250),
  home_url VARCHAR(250),
  logo VARCHAR(250)
);

create TABLE souvenir(
  id SERIAL PRIMARY KEY,
  title VARCHAR(250),
  desc VARCHAR(250),
  discount VARCHAR(250),
  home_url VARCHAR(250),
  logo VARCHAR(250)
);

create TABLE medicine(
  id SERIAL PRIMARY KEY,
  title VARCHAR(250),
  desc VARCHAR(250),
  discount VARCHAR(250),
  home_url VARCHAR(250),
  logo VARCHAR(250)
);