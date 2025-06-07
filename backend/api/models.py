from django.db import models
import uuid

# Inicio de la seccion de Usuario

# credenciales persona - simplified model without any auth fields
class User(models.Model):
    rut = models.IntegerField(primary_key=True, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    id_persona = models.ForeignKey('Persona', on_delete=models.CASCADE, related_name="usuario", null=True, blank=True)
    
    def __str__(self):
        return self.email

# informacion personal del usuario
class Persona(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombres = models.CharField(max_length=200)
    apellidos = models.CharField(max_length=200)
    foto_perfil = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    activo = models.BooleanField(default=True)
    edad = models.PositiveIntegerField()
    genero = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        fecha_formateada = self.fecha_nacimiento.strftime('%d-%m-%Y') if self.fecha_nacimiento else ''
        return f"{self.nombres} {self.apellidos} ({fecha_formateada})"
    
    def calcular_edad(self):
        """
        Calcula la edad en años basada en la fecha de nacimiento
        """
        from datetime import date
        today = date.today()
        born = self.fecha_nacimiento
        age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
        return age
    
    def save(self, *args, **kwargs):
        """
        Sobreescribir el método save para actualizar automáticamente la edad
        """
        if self.fecha_nacimiento:
            self.edad = self.calcular_edad()
        super(Persona, self).save(*args, **kwargs)

# perfil medico del usuario
class PerfilMedico(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_persona = models.OneToOneField(Persona, on_delete=models.CASCADE, related_name="perfil_medico", null=True, blank=True)
    peso = models.DecimalField(max_digits=5, decimal_places=2)
    altura = models.DecimalField(max_digits=5, decimal_places=2)
    tipo_dialisis = models.CharField(
        max_length=50, 
        choices=[
            ('hemodialisis', 'Hemodiálisis'),
            ('dialisis_peritoneal', 'Diálisis Peritoneal')
        ],
        default='hemodialisis'
    )
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    nivel_actividad = models.CharField(max_length=50, choices=[
        ('sedentario', 'Sedentario'),
        ('ligera', 'Ligera'),
        ('moderada', 'Moderada'),
        ('alta', 'Alta'),
        ('muy alta', 'Muy Alta')
    ], default='sedentario')

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(peso__gt=0, peso__lt=500), name='peso_valido'),
            models.CheckConstraint(check=models.Q(altura__gt=0, altura__lt=3), name='altura_valida')
        ]

    def __str__(self):
        return self.id_persona.nombres if self.id_persona else "Sin persona"

    def calcular_imc(self):
        try:
            peso = float(self.peso)
            altura = float(self.altura)
            if altura <= 0:
                print("Error: altura es cero o negativa")
                return 0
            # Cálculo con redondeo a dos decimales
            return round(peso / (altura ** 2), 2)
        except (ValueError, TypeError, ZeroDivisionError) as e:
            print(f"Error al calcular IMC: {e}")
            return 0

    def calcular_calorias_diarias(self, genero, edad, ajuste_renal=True, categorizar=False):
        try:
            peso = float(self.peso)
            altura = float(self.altura)
            edad_num = int(edad) if edad else 30
            
            # Normalizar el género
            genero = genero.lower() if genero else 'femenino'
            
            # Cálculo de TMB (Tasa Metabólica Basal) usando la ecuación de Harris-Benedict revisada
            if genero == 'masculino' or genero == 'm':
                tmb = 88.362 + (13.397 * peso) + (4.799 * altura * 100) - (5.677 * edad_num)
            else:
                tmb = 447.593 + (9.247 * peso) + (3.098 * altura * 100) - (4.330 * edad_num)

            # Factores de actividad mejorados
            factores_actividad = {
                'sedentario': 1.2,     # Poco o ningún ejercicio
                'ligera': 1.375,       # Ejercicio ligero 1-3 días por semana
                'moderada': 1.55,      # Ejercicio moderado 3-5 días por semana
                'alta': 1.725,         # Ejercicio intenso 6-7 días por semana
                'muy alta': 1.9        # Ejercicio muy intenso o entrenamiento 2x/día
            }
            
            # Usar nivel_actividad del perfil, con valor predeterminado
            nivel_actividad = self.nivel_actividad if self.nivel_actividad else 'sedentario'
            
            # Aplicar factor de actividad
            factor = factores_actividad.get(nivel_actividad, 1.2)  # 1.2 como valor predeterminado
            calorias = tmb * factor
            
            # Aplicar ajuste para pacientes renales (reducción del 10%)
            if ajuste_renal:
                calorias = calorias * 0.9
                
            # Redondear resultado
            calorias = round(calorias)
            
            # Opcional: categorizar en grupos de calorías predefinidos
            if categorizar:
                categorias_minuta = [1400, 1600, 1800, 2000]
                categoria_elegida = min(categorias_minuta, key=lambda x: abs(x - calorias))
                return categoria_elegida
                
            return calorias
        except (ValueError, TypeError) as e:
            print(f"Error al calcular calorías: {e}")
            return 0

class CondicionPrevia(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class UsuarioCondicion(models.Model):
    id = models.AutoField(primary_key=True)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="condiciones", null=True, blank=True)
    condicion = models.ForeignKey(CondicionPrevia, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('id_persona', 'condicion')

    def __str__(self):
        return f"{self.id_persona.nombres} {self.id_persona.apellidos} - {self.condicion.nombre}"

class Rol(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class UsuarioRol(models.Model):
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="usuario_roles")
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('id_persona', 'rol')

    def __str__(self):
        return f"{self.id_persona} - {self.rol.nombre}"

class VinculoPacienteCuidador(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="cuidadores")
    cuidador = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="pacientes")
    fecha_creacion = models.DateTimeField(auto_now_add=True)  # ...added field...

    class Meta:
        unique_together = ('paciente', 'cuidador')

    def __str__(self):
        return f"{self.cuidador.nombres} {self.cuidador.apellidos} cuida a {self.paciente.nombres} {self.paciente.apellidos}"

# Fin de la seccion de Usuario
# Inicio Seccion de Alimentos y Medidas
class CategoriaAlimento(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class UnidadMedida(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)
    # New fields for conversion factors
    equivalencia_ml = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Equivalencia en mililitros (ml)")
    equivalencia_g = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Equivalencia en gramos (g)")
    es_volumen = models.BooleanField(default=True, help_text="Indica si es una medida de volumen (ml) o de masa (g)")

    def __str__(self):
        return self.nombre
    
    def factor_conversion(self, para_volumen=True):
        """
        Devuelve el factor de conversión adecuado según si queremos calcular para volumen o masa
        """
        if para_volumen and self.equivalencia_ml:
            return self.equivalencia_ml / 100  # Factor para convertir desde valores por 100ml
        elif not para_volumen and self.equivalencia_g:
            return self.equivalencia_g / 100  # Factor para convertir desde valores por 100g
        return 0.01  # Valor por defecto: 1/100 (para manejar casos donde falta el factor)

class Alimento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    categoria = models.ForeignKey(CategoriaAlimento, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=100, unique=True)
    energia = models.DecimalField(max_digits=6, decimal_places=2)
    humedad = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    cenizas = models.DecimalField(max_digits=6, decimal_places=2)
    proteinas = models.DecimalField(max_digits=5, decimal_places=2)
    hidratos_carbono = models.DecimalField(max_digits=5, decimal_places=2)
    azucares_totales = models.DecimalField(max_digits=5, decimal_places=2)
    fibra_dietetica = models.DecimalField(max_digits=5, decimal_places=2)
    lipidos_totales = models.DecimalField(max_digits=5, decimal_places=2)
    acidos_grasos_saturados = models.DecimalField(max_digits=5, decimal_places=2)
    acidos_grasos_monoinsaturados = models.DecimalField(max_digits=5, decimal_places=2)
    acidos_grasos_poliinsaturados = models.DecimalField(max_digits=5, decimal_places=2)
    acidos_grasos_trans = models.DecimalField(max_digits=5, decimal_places=2)
    colesterol = models.DecimalField(max_digits=5, decimal_places=2)
    vitamina_A = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_C = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_D = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_E = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_K = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_B1 = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_B2 = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    niacina = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_B6 = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    acido_pantotenico = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    vitamina_B12 = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    folatos = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    sodio = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    potasio = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    calcio = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    fosforo = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    magnesio = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    hierro = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    zinc = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    cobre = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    selenio = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    alcohol = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class PorcionAlimento(models.Model):
    id = models.AutoField(primary_key=True)
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name="porciones")
    cantidad = models.DecimalField(max_digits=6, decimal_places=2)
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.alimento.nombre} - {self.cantidad} {self.unidad.nombre}"
# Fin Seccion de Alimentos y Medidas
# Inicio Seccion de Minutas

# Nueva tabla Minuta con solo id y nombre
class Minuta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    genero = models.CharField(max_length=50, blank=True, null=True)
    bajo_en_sodio = models.BooleanField(default=False)
    bajo_en_potasio = models.BooleanField(default=False)
    bajo_en_fosforo = models.BooleanField(default=False)
    bajo_en_proteinas = models.BooleanField(default=False)
    calorias = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    tipo_dialisis = models.CharField(max_length=50, blank=True, null=True, choices=[('hemodialisis', 'Hemodiálisis'), ('dialisis_peritoneal', 'Diálisis Peritoneal'),('ambas', 'Ambas')])

    def __str__(self):
        return self.nombre

class MinutaNutricional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='minutas')
    minuta = models.ForeignKey(Minuta, on_delete=models.SET_NULL, null=True, related_name='asignaciones')
    nombre_minuta = models.CharField(max_length=100, blank=True, null=True)  # Make it optional
    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_vigencia = models.DateField()
    estado = models.CharField(
        max_length=20,
        choices=[('activa', 'Activa'), ('inactiva', 'Inactiva')],
        default='activa'
    )

    def __str__(self):
        persona_nombre = self.id_persona.nombres if self.id_persona else "Sin persona"
        return f"{persona_nombre} - {self.minuta.nombre} ({self.fecha_creacion})"

class NutrienteMinuta(models.Model):
    id = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    unidad = models.CharField(max_length=100, blank=True, null=True)  # Ya cambiado a CharField

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

class RestriccionAlimentos(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class RestriccionMinutaNutriente(models.Model):
    id = models.AutoField(primary_key=True)
    restriccion_id = models.ForeignKey(RestriccionAlimentos, on_delete=models.CASCADE, related_name="restricciones_nutrientes")
    nutriente_id = models.ForeignKey(NutrienteMinuta, on_delete=models.CASCADE, related_name="restricciones_nutrientes")
    valor_minimo = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    valor_maximo = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.restriccion_id.nombre} - {self.nutriente_id.nombre} (Min: {self.valor_minimo}, Max: {self.valor_maximo})"

class MinutasRestricciones(models.Model):
    id = models.AutoField(primary_key=True)
    minuta = models.ForeignKey(MinutaNutricional, on_delete=models.CASCADE, related_name="restricciones")
    restriccion = models.ForeignKey(RestriccionAlimentos, on_delete=models.CASCADE, related_name="minutas_restricciones")

    def __str__(self):
        return f"{self.minuta.id_persona.nombre} - {self.restriccion.nombre}"

class ComidaTipo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    def __str__(self):
        return self.nombre

class Receta(models.Model):

    TIPO_RECETA_CHOICES = [
        ('entrada', 'Entrada'),
        ('plato_principal', 'Plato Principal'),
        ('plato_fondo', 'Plato de Fondo'),
        ('postres_colaciones', 'Postres y Colaciones'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url_imagen = models.CharField(max_length=255, blank=True, null=True)
    nombre = models.CharField(max_length=100)
    preparacion = models.TextField()
    materiales = models.TextField(blank = True, null = True)
    bajo_en_sodio = models.BooleanField(default=False)
    bajo_en_potasio = models.BooleanField(default=False)
    bajo_en_fosforo = models.BooleanField(default=False)
    bajo_en_proteinas = models.BooleanField(default=False)
    tipo_receta = models.CharField(max_length=50, choices=TIPO_RECETA_CHOICES, default='plato_principal')
    activo = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre

class IngredienteReceta(models.Model):
    id = models.AutoField(primary_key=True)
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name="ingredientes")
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=6, decimal_places=2)
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.receta.nombre} - {self.alimento.nombre}"

class DetalleMinuta(models.Model):
    id = models.AutoField(primary_key=True)
    minuta_id = models.ForeignKey(Minuta, on_delete=models.CASCADE, related_name="detalles", null=True, blank=True)
    dia_semana = models.CharField(max_length=20, blank=True, null=True)
    comida_tipo = models.ForeignKey(ComidaTipo, on_delete=models.CASCADE, related_name="detalles", null=True, blank=True)  # Cambiado de comida_dia a comida_tipo
    nombre_comida = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(blank=True, null=True)
    imagen_url = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        # Actualizado para usar los nuevos campos
        persona_nombre = self.minuta_id.id_persona.nombres if self.minuta_id and self.minuta_id.id_persona else "Sin persona"
        comida_nombre = self.comida_tipo.nombre if self.comida_tipo else "Sin tipo de comida"
        return f"{persona_nombre} - {comida_nombre}"

class RegistroComida(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="registros_comida", null=True, blank=True)
    alimento = models.ForeignKey(Alimento, on_delete=models.SET_NULL, null=True, blank=True)
    unidad_medida = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_consumo = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.id_persona.nombres if self.id_persona else 'Sin persona'} - {self.fecha_consumo}"

class AnalisisImagen(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name="analisis_imagenes", null=True, blank=True)
    url_imagen = models.CharField(max_length=255)
    fecha_analisis = models.DateTimeField(auto_now_add=True)
    resultado = models.JSONField()
    nombre = models.TextField(blank=True, null=True)
    alimentos_detectados = models.ManyToManyField(Alimento, blank=True, related_name="apariciones_en_analisis")

    def __str__(self):
        return f"{self.id_persona.nombres if self.id_persona else 'Sin persona'} - {self.fecha_analisis}"

# Fin Seccion de Minutas
# Inicio Seccion de Ayudas
class CentroMedico(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    direccion = models.TextField()
    latitud = models.DecimalField(max_digits=10, decimal_places=8)
    longitud = models.DecimalField(max_digits=11, decimal_places=8)
    tipo_centro = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    comuna = models.CharField(max_length=50, blank=True, null=True)
    horario = models.TextField(blank=True, null=True)
    servicio_dialisis = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class ConsejoNutricional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url_imagen = models.CharField(max_length=255)
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    categoria = models.CharField(max_length=50, blank=True, null=True)
    fecha_publicacion = models.DateField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.titulo
# Fin Seccion de Ayudas
# Inicio Seccion Comunidad

class Foro(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    imagen = models.CharField(max_length=255, blank=True, null=True)
    es_general = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Foro"
        verbose_name_plural = "Foros"

class Publicacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='publicaciones')
    foro = models.ForeignKey(Foro, on_delete=models.CASCADE, related_name='publicaciones', null=True, blank=True)
    imagen = models.CharField(max_length=255, blank=True, null=True)
    asunto = models.CharField(max_length=100)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.asunto} - {self.id_persona}"
    
    class Meta:
        verbose_name = "Publicación"
        verbose_name_plural = "Publicaciones"
        ordering = ['-fecha_creacion']


class Comentario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='comentarios')
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='comentarios')
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"Comentario por {self.id_persona} en {self.publicacion.asunto[:20]}"
    
    class Meta:
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"
        ordering = ['fecha_creacion']


class RespuestaComentario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comentario = models.ForeignKey(Comentario, on_delete=models.CASCADE, related_name='respuestas')
    respuesta_padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='respuestas_anidadas')
    id_persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='respuestas_comentario')
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        if self.respuesta_padre:
            return f"Respuesta por {self.id_persona} a respuesta de {self.respuesta_padre.id_persona}"
        return f"Respuesta por {self.id_persona} a comentario de {self.comentario.id_persona}"
    
    class Meta:
        verbose_name = "Respuesta a Comentario"
        verbose_name_plural = "Respuestas a Comentarios"
        ordering = ['fecha_creacion']

class ForoPersona(models.Model):
    """
    Modelo para representar la suscripción de un usuario a un foro específico.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    foro = models.ForeignKey(Foro, on_delete=models.CASCADE, related_name='suscriptores')
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='foros_suscritos')
    fecha_suscripcion = models.DateTimeField(auto_now_add=True)
    notificaciones = models.BooleanField(default=True, help_text="Indica si el usuario recibirá notificaciones de este foro")
    
    class Meta:
        unique_together = ('foro', 'persona')
        verbose_name = "Suscripción a Foro"
        verbose_name_plural = "Suscripciones a Foros"
    
    def __str__(self):
        return f"{self.persona.nombres} {self.persona.apellidos} - {self.foro.nombre}"

# Fin Seccion Comunidad