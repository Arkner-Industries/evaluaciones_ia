create database evaluaciones_ia;
use evaluaciones_ia;
select * from usuario;
-- talba 1
create table usuario( 
	id int primary key auto_increment,
    nombre_usuario varchar(100) unique not null,
    contrasena varchar(250) not null, 
    email varchar(250) unique not null,
    rol enum('alumno', 'profesor', 'administrador') not null,
    fecha_registro timestamp default current_timestamp 
);
-- talbla 2
create table alumno(
	id int primary key auto_increment,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    id_usuario int unique,
    foreign key (id_usuario) references usuario(id)
);
-- talba 3
create table profesor (
	id int primary key auto_increment,
    nombre varchar(100) not null,
    apellido varchar(100) not null,
    id_usuario int unique,
    foreign key (id_usuario) references usuario(id)
);
-- tabla 4
create table profesor_alumno (
	id_profesor int,
    id_alumno int,
    primary key (id_profesor, id_alumno),
    foreign key (id_profesor) references profesor(id),
    foreign key (id_alumno) references alumno(id)
);
-- tabla 5a
create table grupo (
	id int primary key auto_increment,
    nombre_grupo varchar(100) not null,
    codigo varchar(12) not null unique,
    id_profesor int not null,
    fecha_creacion timestamp default current_timestamp,
    foreign key (id_profesor) references profesor(id)
);
-- tabla 5b
create table grupo_alumno (
    id_grupo int,
    id_alumno int,
    fecha_ingreso timestamp default current_timestamp,
    primary key (id_grupo, id_alumno),
    foreign key (id_grupo) references grupo(id) on delete cascade,
    foreign key (id_alumno) references alumno(id) on delete cascade
);
-- tabla 6
create table evaluacion (
	id int primary key auto_increment,
    id_profesor int,
    id_grupo int,
    titulo varchar(250),
    descripcion text,
    fecha date,
    foreign key (id_profesor) references profesor(id),
    foreign key (id_grupo) references grupo(id)
);
-- 7
create table evaluacion_alumno (
	id int primary key auto_increment,
    id_evaluacion int,
    id_alumno int,
    fecha date,
    nota decimal (5,2),
    unique (id_evaluacion, id_alumno),
    foreign key (id_evaluacion) references evaluacion(id),
    foreign key (id_alumno) references alumno(id)
);
-- 8
create table preguntas (
	id int primary key auto_increment,
    id_evaluacion int,
    pregunta text,
    respuesta_correcta text,
    foreign key (id_evaluacion) references evaluacion(id)
);
-- 9
create table respuestas (
	id int primary key auto_increment,
    id_evaluacion_alumno int,
    id_pregunta int,
    respuesta text,
    correccion_ia text,
    nota decimal (3,1),
    foreign key (id_evaluacion_alumno) references evaluacion_alumno(id),
    foreign key (id_pregunta) references preguntas(id)
);
-- 10
create table entrega_codigo (
	id int primary key auto_increment,
    id_evaluacion_alumno int,
    id_alumno int,
    id_profesor int,
    nombre_archivo varchar(250),
    ruta_archivo varchar(250),
    fecha date,
    estado varchar(250),
    foreign key (id_evaluacion_alumno) references evaluacion_alumno(id),
    foreign key (id_alumno) references alumno(id),
    foreign key (id_profesor) references profesor(id)
);
-- 11
create table trabajo_individual (
	id_evaluacion_alumno int primary key,
    tiempo_dedicado int,
    foreign key (id_evaluacion_alumno) references evaluacion_alumno(id)
);
-- 12
create table trabajo_grupal (
	id_evaluacion_alumno int primary key,
    id_grupo int,
    nota_grupal decimal (3,1),
    tiempo_dedicado int,
    foreign key (id_evaluacion_alumno) references evaluacion_alumno(id),
    foreign key (id_grupo) references grupo(id)
);