-- FIXME: Needs new name
create database loanage;

create table library (
  library_id int primary key,
  loc varchar(16),
  library_name varchar(32) not null
);

create table library_contains (
  library_id int,
  book_id int,
  author_id int,
  no_of_copies int default 0,
  primary key (library_id, book_id, author_id),
  foreign key (library_id) references library (library_id) on update cascade,
  foreign key (book_id) references book (book_id) on update cascade,
  foreign key (author_id) references author (author_id) on update cascade
);

create table author (
  author_id int,
  aname varchar(64) not null,
  biography text,
  primary key (author_id)
);

create table genre (
  book_id int,
  label varchar(16),
  primary key (book_id, label),
  foreign key (book_id) references book (book_id)
);

create table book (
  book_id int,
  author_id int,
  library_id int,
  pdate date,
  synopsis text,
  title varchar(64) not null,
  no_of_copies int default 0,
  primary key (book_id, author_id, library_id),
  foreign key (author_id) references author (author_id),
  foreign key (library_id) references library (library_id)
);

create table review (
  review_id int,
  user_id int,
  rating int not null check (rating > 0 and rating < 6),
  body text,
  book_id int not null,
  primary key (review_id, user_id),
  foreign key (user_id) references user (user_id),
  foreign key (book_id) references book (book_id)
);

create table user (
  user_id int primary key,
  uname varchar(64) not null,
  address varchar(32),
  -- TODO: Validate in update constraint(?)
  -- See https://en.wikipedia.org/wiki/E.164
  phone_no varchar(15)
);

create table librarian (
  super_id int primary key,
  appointer int not null,
  foreign key (super_id) references user (user_id),
  foreign key (appointer) references admin (super_id)
);

create table head_librarian (
  super_id int primary key,
  foreign key (super_id) references user (user_id)
);

create table loan (
  loan_id int,
  user_id int,
  ret_date time with time zone not null,
  start_date time with time zone not null,
  librarian_id int not null,
  primary key (loan_id, user_id),
  foreign key (user_id) references user (user_id),
  foreign key (librarian_id) references librarian (librarian_id)
);

create table authentication (
  user_id int primary key,
  username varchar(16) not null unique,
  -- TODO: Decide how encoded as database
  pass char(16) not null,
  foreign key (user_id) references user (user_id)
);

create table monitors_user (
  admin_id int not null,
  user_id int not null,
  foreign key (admin_id) references admin (super_id),
  foreign key (user_id) references user (user_id)
);

-- TODO: Model as view(?)
create table loan_book (
  loan_id int not null,
  user_id int not null,
  book_id int not null,
  author_id int not null,
  library_id int not null,
  foreign key (loan_id) references loan (loan_id),
  foreign key (user_id) references user (user_id),
  foreign key (book_id) references book (book_id),
  foreign key (author_id) references author (author_id),
  foreign key (library_id) references library (library_id)
);
