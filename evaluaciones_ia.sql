create database evaluaciones_ia;
use evaluaciones_ia;
select * from usuario;
-- talba 1
create table usuario( 
	id int primary key auto_increment,
    usuario varchar(100) unique not null,
    contrasena varchar(50) unique not null, -- esto se tiene que guardar en un hash mas adelante
    email varchar(100) unique not null,
    rol enum('alumno', 'profesor') not null,
    fecha_registro timestamp default current_timestamp -- inserta una fecha automaticamente si no se le asigna una fecha manualmente
);
-- talbla 2
create table alumno(
	id int primary key auto_increment,
    nombre varchar(100),
    apellido varchar(100),
    id_usuario int unique,
    foreign key (id_usuario) references usuario(id)
);
-- talba 3
create table profesor (
	id int primary key auto_increment,
    nombre varchar(100),
    apellido varchar(100),
    materia varchar(100),
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
-- tabla 5
create table grupo (
	id int primary key auto_increment,
    nombre_grupo varchar(100),
    id_alumno int,
    foreign key (id_alumno) references alumno(id)
);
-- tabla 6
create table evaluacion (
	id int primary key auto_increment,
    id_profesor int,
    titulo varchar(250),
    descripcion text,
    fecha date,
    foreign key (id_profesor) references profesor(id)
);
-- 7
create table evaluacion_alumno (
	id int primary key auto_increment,
    id_evaluacion int,
    id_alumno int,
    fecha date,
    nota decimal (5,2),
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
    nota decimal (5,2),
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