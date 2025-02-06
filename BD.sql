-- Crear extensión para UUID si se necesita
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$')
);

-- Tabla de Perfiles Médicos
CREATE TABLE perfiles_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    peso DECIMAL(5,2) CHECK (peso > 0 AND peso < 500),
    altura DECIMAL(5,2) CHECK (altura > 0 AND altura < 3),
    condiciones_especificas TEXT,
    tipo_dialisis VARCHAR(50),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías de Alimentos
CREATE TABLE categorias_alimentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de Unidades de Medida
CREATE TABLE unidades_medida (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de Alimentos
CREATE TABLE alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id INTEGER REFERENCES categorias_alimentos(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    energia DECIMAL(6,2) CHECK (energia >= 0),
    cenizas DECIMAL(6,2) CHECK (cenizas >= 0),
    proteinas DECIMAL(5,2) CHECK (proteinas >= 0),
    hidratos_carbono DECIMAL(5,2) CHECK (hidratos_carbono >= 0),
    azucares_totales DECIMAL(5,2) CHECK (azucares_totales >= 0),
    fibra_dietetica DECIMAL(5,2) CHECK (fibra_dietetica >= 0),
    lipidos_totales DECIMAL(5,2) CHECK (lipidos_totales >= 0),
    carbohidratos DECIMAL(5,2) CHECK (carbohidratos >= 0),
    acidos_grasos_saturados DECIMAL(5,2) CHECK (acidos_grasos_saturados >= 0),
    acidos_grasos_monoinsaturados DECIMAL(5,2) CHECK (acidos_grasos_monoinsaturados >= 0),
    acidos_grasos_poliinsaturados DECIMAL(5,2) CHECK (acidos_grasos_poliinsaturados >= 0),
    acidos_grasos_trans DECIMAL(5,2) CHECK (acidos_grasos_trans >= 0),
    colesterol DECIMAL(5,2) CHECK (colesterol >= 0),
    vitamina_A DECIMAL(6,2),
    vitamina_C DECIMAL(6,2),
    vitamina_D DECIMAL(6,2),
    vitamina_E DECIMAL(6,2),
    vitamina_K DECIMAL(6,2),
    vitamina_B1 DECIMAL(6,2),
    vitamina_B2 DECIMAL(6,2),
    niancina DECIMAL(6,2),
    vitamina_B6 DECIMAL(6,2),
    acido_pantotenico DECIMAL(6,2),
    vitamina_B12 DECIMAL(6,2),
    folatos DECIMAL(6,2),
    sodio DECIMAL(6,2),
    potasio DECIMAL(6,2),
    calcio DECIMAL(6,2),
    fosforo DECIMAL(6,2),
    magnesio DECIMAL(6,2),
    hierro DECIMAL(6,2),
    zinc DECIMAL(6,2),
    cobre DECIMAL(6,2),
    selenio DECIMAL(6,2),
    alcohol DECIMAL(6,2),
    activo BOOLEAN DEFAULT true
);

-- Tabla de Porciones de Alimentos
CREATE TABLE porciones_alimentos (
    id SERIAL PRIMARY KEY,
    alimento_id UUID REFERENCES alimentos(id) ON DELETE CASCADE,
    cantidad DECIMAL(6,2) CHECK (cantidad > 0),
    unidad_id INTEGER REFERENCES unidades_medida(id) ON DELETE SET NULL
);

-- Tabla de Minutas Nutricionales
CREATE TABLE minutas_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    fecha_vigencia DATE CHECK (fecha_vigencia >= fecha_creacion),
    estado VARCHAR(20) DEFAULT 'activa'
);

-- Tabla de Detalles de Minuta
CREATE TABLE detalles_minuta (
    id SERIAL PRIMARY KEY,
    minuta_id UUID REFERENCES minutas_nutricionales(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id) ON DELETE CASCADE,
    porcion_id INTEGER REFERENCES porciones_alimentos(id),
    tiempo_comida VARCHAR(20)
);

-- Tabla de Imágenes de Comida
CREATE TABLE imagenes_comida (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    resultado_ia VARCHAR(100),
    confianza_prediccion DECIMAL(4,3) CHECK (confianza_prediccion BETWEEN 0 AND 1),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Registro de Comidas
CREATE TABLE registro_comidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id) ON DELETE SET NULL,
    porcion_id INTEGER REFERENCES porciones_alimentos(id),
    fecha_consumo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Tabla de Centros Médicos
CREATE TABLE centros_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10,8) CHECK (latitud BETWEEN -90 AND 90),
    longitud DECIMAL(11,8) CHECK (longitud BETWEEN -180 AND 180),
    tipo_centro VARCHAR(50),
    telefono VARCHAR(20),
    horario TEXT,
    servicio_dialisis BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true
);

-- Tabla de Publicaciones en Comunidad
CREATE TABLE publicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    asunto VARCHAR(100),
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    activo BOOLEAN DEFAULT true
);

-- Nueva tabla 'recetas' para describir comidas con más detalle
CREATE TABLE recetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    instrucciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para asociar comidas con sus alimentos y porciones
CREATE TABLE recetas_alimentos (
    id SERIAL PRIMARY KEY,
    receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id) ON DELETE CASCADE,
    porcion_id INTEGER REFERENCES porciones_alimentos(id)
);

-- Tabla de Comentarios en Comunidad
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publicacion_id UUID REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Consejos Nutricionales
CREATE TABLE consejos_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(50),
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true
);

-- Tabla de Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla intermedia para asociar usuarios y roles
CREATE TABLE usuarios_roles (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE, -- ADMIN, MEDICO, PACIENTE
    PRIMARY KEY (usuario_id, rol_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_perfiles_medicos_usuario ON perfiles_medicos(usuario_id);
CREATE INDEX idx_registro_comidas_usuario ON registro_comidas(usuario_id);
CREATE INDEX idx_publicaciones_usuario ON publicaciones(usuario_id);
CREATE INDEX idx_comentarios_publicacion ON comentarios(publicacion_id);
CREATE INDEX idx_alimentos_categoria ON alimentos(categoria_id);
CREATE INDEX idx_centros_medicos_coordenadas ON centros_medicos(latitud, longitud);

-- Trigger para actualizar la fecha de última actualización en perfiles médicos
CREATE OR REPLACE FUNCTION actualizar_ultima_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_perfil_medico
BEFORE UPDATE ON perfiles_medicos
FOR EACH ROW
EXECUTE FUNCTION actualizar_ultima_actualizacion();
