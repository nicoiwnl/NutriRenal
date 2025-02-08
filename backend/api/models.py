from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.hashers import make_password

class Usuario(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    foto_perfil = models.ImageField(upload_to='imagenes/', blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    edad = models.PositiveIntegerField()
    genero = models.CharField(max_length=50, blank=True, null=True)
    alergias = models.TextField(blank=True, null=True)

    USERNAME_FIELD = 'email'

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(edad__gt=0), name='edad_gt_0'),
            models.CheckConstraint(check=models.Q(email__regex=r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), name='email_valido')
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class PerfilMedico(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name="perfil_medico")
    peso = models.DecimalField(max_digits=5, decimal_places=2)
    altura = models.DecimalField(max_digits=5, decimal_places=2)
    condiciones_especificas = models.TextField(blank=True, null=True)
    tipo_dialisis = models.CharField(max_length=50, blank=True, null=True)
    ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(peso__gt=0, peso__lt=500), name='peso_valido'),
            models.CheckConstraint(check=models.Q(altura__gt=0, altura__lt=3), name='altura_valida')
        ]

class CondicionPrevia(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

class UsuarioCondicion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="condiciones")
    condicion = models.ForeignKey(CondicionPrevia, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('usuario', 'condicion')

class CategoriaAlimento(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

class UnidadMedida(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)

class Alimento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    categoria = models.ForeignKey(CategoriaAlimento, on_delete=models.SET_NULL, null=True, blank=True)
    nombre = models.CharField(max_length=100, unique=True)
    energia = models.DecimalField(max_digits=6, decimal_places=2)
    cenizas = models.DecimalField(max_digits=6, decimal_places=2)
    proteinas = models.DecimalField(max_digits=5, decimal_places=2)
    hidratos_carbono = models.DecimalField(max_digits=5, decimal_places=2)
    azucares_totales = models.DecimalField(max_digits=5, decimal_places=2)
    fibra_dietetica = models.DecimalField(max_digits=5, decimal_places=2)
    lipidos_totales = models.DecimalField(max_digits=5, decimal_places=2)
    carbohidratos = models.DecimalField(max_digits=5, decimal_places=2)
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

class PorcionAlimento(models.Model):
    id = models.AutoField(primary_key=True)
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name="porciones")
    cantidad = models.DecimalField(max_digits=6, decimal_places=2)
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)

class MinutaNutricional(models.Model):
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('inactiva', 'Inactiva'),
        ('expirada', 'Expirada'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="minutas")
    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_vigencia = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa')

class ComidaDia(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)

class Receta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    preparacion = models.TextField()
    informacion_nutricional = models.TextField(blank=True, null=True)

class IngredienteReceta(models.Model):
    id = models.AutoField(primary_key=True)
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name="ingredientes")
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=6, decimal_places=2)
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)

class DetalleMinuta(models.Model):
    id = models.AutoField(primary_key=True)
    minuta = models.ForeignKey(MinutaNutricional, on_delete=models.CASCADE, related_name="detalles")
    comida = models.ForeignKey(ComidaDia, on_delete=models.CASCADE)
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE)

class ImagenComida(models.Model):
    id = models.AutoField(primary_key=True)
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name="imagenes")
    url_imagen = models.ImageField(upload_to='imagenes/')

class RegistroComida(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="registros_comida")
    alimento = models.ForeignKey(Alimento, on_delete=models.SET_NULL, null=True, blank=True)
    porcion = models.ForeignKey(PorcionAlimento, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_consumo = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True, null=True)

class CentroMedico(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    direccion = models.TextField()
    latitud = models.DecimalField(max_digits=10, decimal_places=8)
    longitud = models.DecimalField(max_digits=11, decimal_places=8)
    tipo_centro = models.CharField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    horario = models.TextField(blank=True, null=True)
    servicio_dialisis = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

class ConsejoNutricional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url_imagen = models.ImageField(upload_to='imagenes/', blank=True, null=True)
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    categoria = models.CharField(max_length=50, blank=True, null=True)
    fecha_publicacion = models.DateField(auto_now_add=True)
    activo = models.BooleanField(default=True)

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)

class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="roles")
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('usuario', 'rol')

class Publicacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="publicaciones")
    asunto = models.CharField(max_length=100, blank=True, null=True)
    contenido = models.TextField()
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

class Comentario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name="comentarios")
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    contenido = models.TextField()
    fecha_comentario = models.DateTimeField(auto_now_add=True)

class RespuestaComentario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comentario = models.ForeignKey(Comentario, on_delete=models.CASCADE, related_name="respuestas")
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    contenido = models.TextField()
    fecha_respuesta = models.DateTimeField(auto_now_add=True)

class AnalisisImagen(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="analisis_imagenes")
    url_imagen = models.ImageField(upload_to='imagenes/')
    fecha_analisis = models.DateTimeField(auto_now_add=True)
    resultado = models.JSONField()
    conclusion = models.TextField(blank=True, null=True)
