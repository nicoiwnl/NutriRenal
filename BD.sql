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
    edad INTEGER CHECK (edad > 0),
    genero VARCHAR(50),
    alergias TEXT,
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

-- Tabla de Condiciones Previas
CREATE TABLE condiciones_previas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla intermedia para asociar usuarios y condiciones previas
CREATE TABLE usuarios_condiciones (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    condicion_id INTEGER REFERENCES condiciones_previas(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, condicion_id)
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
    activo BOOLEAN DEFAULT true,
    CONSTRAINT nombre_unico UNIQUE (nombre)
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

-- Tabla de Comidas del Día
CREATE TABLE comidas_dia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar comidas del día
INSERT INTO comidas_dia (nombre) VALUES ('Desayuno'), ('Colación'), ('Almuerzo'), ('Cena');

-- Tabla de Recetas
CREATE TABLE recetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    preparacion TEXT NOT NULL,
    informacion_nutricional TEXT
);

-- Tabla de Ingredientes de Recetas
CREATE TABLE ingredientes_recetas (
    id SERIAL PRIMARY KEY,
    receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
    alimento_id UUID REFERENCES alimentos(id) ON DELETE CASCADE,
    cantidad DECIMAL(6,2) CHECK (cantidad > 0),
    unidad_id INTEGER REFERENCES unidades_medida(id) ON DELETE SET NULL
);

-- Tabla de Detalles de Minuta
CREATE TABLE detalles_minuta (
    id SERIAL PRIMARY KEY,
    minuta_id UUID REFERENCES minutas_nutricionales(id) ON DELETE CASCADE,
    comida_id INTEGER REFERENCES comidas_dia(id) ON DELETE CASCADE,
    receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE
);

-- Tabla de Imágenes de Comida
CREATE TABLE imagenes_comida (
    id SERIAL PRIMARY KEY,
    receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL
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

-- Tabla de Consejos Nutricionales
CREATE TABLE consejos_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url_imagen VARCHAR(255),
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

-- Tabla de Comentarios en Comunidad
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publicacion_id UUID REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Respuestas a Comentarios
CREATE TABLE respuestas_comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comentario_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Análisis de Imágenes
CREATE TABLE analisis_imagenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    fecha_analisis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resultado JSONB NOT NULL, -- Almacena los resultados del análisis de la IA
    conclusion TEXT
);

-- Índices para las tablas de referencia
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_perfiles_medicos_usuario_id ON perfiles_medicos(usuario_id);
CREATE INDEX idx_usuarios_condiciones_usuario_id ON usuarios_condiciones(usuario_id);
CREATE INDEX idx_usuarios_condiciones_condicion_id ON usuarios_condiciones(condicion_id);
CREATE INDEX idx_alimentos_categoria_id ON alimentos(categoria_id);
CREATE INDEX idx_porciones_alimentos_alimento_id ON porciones_alimentos(alimento_id);
CREATE INDEX idx_minutas_nutricionales_usuario_id ON minutas_nutricionales(usuario_id);
CREATE INDEX idx_detalles_minuta_minuta_id ON detalles_minuta(minuta_id);
CREATE INDEX idx_detalles_minuta_comida_id ON detalles_minuta(comida_id);
CREATE INDEX idx_detalles_minuta_receta_id ON detalles_minuta(receta_id);
CREATE INDEX idx_registro_comidas_usuario_id ON registro_comidas(usuario_id);
CREATE INDEX idx_registro_comidas_alimento_id ON registro_comidas(alimento_id);
CREATE INDEX idx_centros_medicos_nombre ON centros_medicos(nombre);
CREATE INDEX idx_consejos_nutricionales_categoria ON consejos_nutricionales(categoria);
CREATE INDEX idx_publicaciones_usuario_id ON publicaciones(usuario_id);
CREATE INDEX idx_comentarios_publicacion_id ON comentarios(publicacion_id);
CREATE INDEX idx_comentarios_usuario_id ON comentarios(usuario_id);
CREATE INDEX idx_respuestas_comentarios_comentario_id ON respuestas_comentarios(comentario_id);
CREATE INDEX idx_respuestas_comentarios_usuario_id ON respuestas_comentarios(usuario_id);
CREATE INDEX idx_analisis_imagenes_usuario_id ON analisis_imagenes(usuario_id);

-- Función para actualizar la fecha de última actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la tabla perfiles_medicos
CREATE TRIGGER trigger_actualizar_fecha_actualizacion
BEFORE UPDATE ON perfiles_medicos
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_actualizacion();

--Ejemplos minutas con datos
-- Insertar una minuta nutricional
INSERT INTO minutas_nutricionales (id, usuario_id, fecha_creacion, fecha_vigencia, estado)
VALUES (uuid_generate_v4(), 'usuario_uuid', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'activa');

-- Obtener el ID de la minuta recién creada
-- (En un entorno real, esto se haría programáticamente)

-- Insertar comidas del día para la minuta
INSERT INTO detalles_minuta (minuta_id, comida_id, receta_id)
VALUES ('minuta_uuid', (SELECT id FROM comidas_dia WHERE nombre = 'Desayuno'), 'receta_uuid_desayuno'),
       ('minuta_uuid', (SELECT id FROM comidas_dia WHERE nombre = 'Colación'), 'receta_uuid_colacion'),
       ('minuta_uuid', (SELECT id FROM comidas_dia WHERE nombre = 'Almuerzo'), 'receta_uuid_almuerzo'),
       ('minuta_uuid', (SELECT id FROM comidas_dia WHERE nombre = 'Cena'), 'receta_uuid_cena');

-- Insertar recetas
INSERT INTO recetas (id, nombre, preparacion, informacion_nutricional)
VALUES ('receta_uuid_desayuno', 'Desayuno Saludable', 'Instrucciones de preparación...', 'Información nutricional...'),
       ('receta_uuid_colacion', 'Colación Ligera', 'Instrucciones de preparación...', 'Información nutricional...'),
       ('receta_uuid_almuerzo', 'Almuerzo Completo', 'Instrucciones de preparación...', 'Información nutricional...'),
       ('receta_uuid_cena', 'Cena Ligera', 'Instrucciones de preparación...', 'Información nutricional...');

-- Insertar ingredientes de recetas
INSERT INTO ingredientes_recetas (receta_id, alimento_id, cantidad, unidad_id)
VALUES ('receta_uuid_desayuno', 'alimento_uuid_1', 100, (SELECT id FROM unidades_medida WHERE nombre = 'gramos')),
       ('receta_uuid_desayuno', 'alimento_uuid_2', 200, (SELECT id FROM unidades_medida WHERE nombre = 'mililitros')),
       -- Más ingredientes para el desayuno
       ('receta_uuid_colacion', 'alimento_uuid_3', 50, (SELECT id FROM unidades_medida WHERE nombre = 'gramos')),
       -- Más ingredientes para la colación
       ('receta_uuid_almuerzo', 'alimento_uuid_4', 150, (SELECT id FROM unidades_medida WHERE nombre = 'gramos')),
       -- Más ingredientes para el almuerzo
       ('receta_uuid_cena', 'alimento_uuid_5', 100, (SELECT id FROM unidades_medida WHERE nombre = 'gramos'));
       -- Más ingredientes para la cena


--Implementacion en backend
/*
    def asignar_minutas(usuario):
        # Obtener estadísticas del usuario
        perfil_medico = obtener_perfil_medico(usuario.id)
        
        # Seleccionar minutas adecuadas basadas en las estadísticas del usuario
        minutas_adecuadas = seleccionar_minutas(perfil_medico)
        
        # Asignar minutas al usuario
        for minuta in minutas_adecuadas:
            asignar_minuta_a_usuario(usuario.id, minuta.id)

    def seleccionar_minutas(perfil_medico):
        # Lógica para seleccionar minutas basadas en las estadísticas del usuario
        # Por ejemplo, filtrar por condiciones específicas, género, peso, altura, etc.
        return minutas_filtradas

    def asignar_minuta_a_usuario(usuario_id, minuta_id):
        # Insertar registro en la tabla de minutas_nutricionales
        insertar_minuta_usuario(usuario_id, minuta_id)
*/

--Mostrar minutas en frontend
/*
async function obtenerMinutas() {
    const response = await fetch('/api/minutas');
    const minutas = await response.json();
    mostrarMinutas(minutas);
}

function mostrarMinutas(minutas) {
    // Lógica para mostrar las minutas en la interfaz de usuario
    // Por ejemplo, renderizar una lista de minutas con sus detalles
}
*/

/*
IDEA DE IMPLEMENTACION PARA EL TEMA DE EL CONTROL DE CALORIAS Y COMO USAR LAS COMIDAS ACORDE A PESO , ALTURA , EDAD , GENERO Y ACTIVIDAD FISICA

def calcular_tmb(peso, altura, edad, genero):
    if genero == 'hombre':
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad)
    elif genero == 'mujer':
        tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad)
    else:
        raise ValueError("Género no válido")
    return tmb

def calcular_get(tmb, nivel_actividad):
    factores_actividad = {
        'sedentario': 1.2,
        'ligera': 1.375,
        'moderada': 1.55,
        'alta': 1.725,
        'muy alta': 1.9
    }
    if nivel_actividad not in factores_actividad:
        raise ValueError("Nivel de actividad no válido")
    return tmb * factores_actividad[nivel_actividad]

# Ejemplo de uso
peso = 70  # kg
altura = 175  # cm
edad = 30  # años
genero = 'hombre'
nivel_actividad = 'moderada'

tmb = calcular_tmb(peso, altura, edad, genero)
get = calcular_get(tmb, nivel_actividad)

print(f"TMB: {tmb} calorías/día")
print(f"GET: {get} calorías/día")
*/
