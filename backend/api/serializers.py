from rest_framework import serializers
from .models import (
    PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaTipo, Minuta, Receta, IngredienteReceta, DetalleMinuta, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen, VinculoPacienteCuidador,
    NutrienteMinuta, RestriccionAlimentos, RestriccionMinutaNutriente, MinutasRestricciones, Foro, User, Persona, ForoPersona, SeleccionesAnalisis, AnalisisIngredientes # Make sure these imports match your actual models
)
from django.conf import settings
from datetime import datetime

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['rut', 'email', 'password', 'id_persona']
        extra_kwargs = {'password': {'write_only': True}}

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ['id', 'nombres', 'apellidos', 'foto_perfil', 'fecha_nacimiento', 'activo', 'edad', 'genero']

class RegisterSerializer(serializers.Serializer):
    rut = serializers.IntegerField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    nombres = serializers.CharField(required=False, default='')
    apellidos = serializers.CharField(required=False, default='')
    foto_perfil = serializers.CharField(required=False, allow_blank=True, default='')
    fecha_nacimiento = serializers.DateField(required=False, default=datetime.now().date())
    edad = serializers.IntegerField(required=False, default=0)
    genero = serializers.CharField(required=False, allow_blank=True, default='')


class PerfilMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilMedico
        fields = '__all__'

class CondicionPreviaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CondicionPrevia
        fields = '__all__'

class UsuarioCondicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioCondicion
        fields = '__all__'

class CategoriaAlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaAlimento
        fields = '__all__'

class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'

class AlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alimento
        fields = '__all__'

class PorcionAlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PorcionAlimento
        fields = '__all__'

# Añadir serializer para Minuta
class MinutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Minuta
        fields = '__all__'

class MinutaNutricionalSerializer(serializers.ModelSerializer):
    minuta_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = MinutaNutricional
        # Exclude nombre_minuta if you're using the SerializerMethodField instead
        exclude = ['nombre_minuta'] if 'nombre_minuta' in [f.name for f in MinutaNutricional._meta.get_fields()] else []
    
    def get_minuta_nombre(self, obj):
        return obj.minuta.nombre if obj.minuta else None

# Reemplazar ComidaDiaSerializer con ComidaTipoSerializer
class ComidaTipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComidaTipo
        fields = '__all__'

class RecetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receta
        fields = '__all__'

class IngredienteRecetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredienteReceta
        fields = '__all__'

class DetalleMinutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleMinuta
        fields = '__all__'
        # Asegúrate de incluir los nuevos campos agregados a DetalleMinuta

class RegistroComidaSerializer(serializers.ModelSerializer):
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all())
    # Referencia directa al modelo UnidadMedida
    unidad_medida = serializers.PrimaryKeyRelatedField(queryset=UnidadMedida.objects.all())
    
    class Meta:
        model = RegistroComida
        fields = ['id', 'id_persona', 'alimento', 'unidad_medida', 'fecha_consumo', 'notas']

class CentroMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroMedico
        fields = '__all__'

class ConsejoNutricionalSerializer(serializers.ModelSerializer):
    url_imagen = serializers.SerializerMethodField()

    def get_url_imagen(self, obj):
        if obj.url_imagen:
            # Asegurar que no haya doble "imagenes/"
            ruta_imagen = obj.url_imagen.lstrip('/')  # Eliminar "/" si está al inicio
            return f"/static/{ruta_imagen}"
        return None

    class Meta:
        model = ConsejoNutricional
        fields = '__all__'

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre']

class UsuarioRolSerializer(serializers.ModelSerializer):
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())
    id_persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all())
    
    class Meta:
        model = UsuarioRol
        fields = '__all__'
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['rol'] = {
            'id': instance.rol.id,
            'nombre': instance.rol.nombre
        }
        return representation

class ForoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Foro
        fields = '__all__'

class PublicacionSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()
    comentarios_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Publicacion
        fields = '__all__'

    def get_autor_nombre(self, obj):
        if obj.id_persona:
            return f"{obj.id_persona.nombres} {obj.id_persona.apellidos}"
        return "Usuario"

    def get_autor_foto(self, obj):
        if obj.id_persona and obj.id_persona.foto_perfil:
            return obj.id_persona.foto_perfil
        return None
    
    def get_comentarios_count(self, obj):
        return obj.comentarios.filter(activo=True).count()


class ComentarioSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()
    
    class Meta:
        model = Comentario
        fields = '__all__'

    def get_autor_nombre(self, obj):
        if obj.id_persona:
            return f"{obj.id_persona.nombres} {obj.id_persona.apellidos}"
        return "Usuario"

    def get_autor_foto(self, obj):
        if obj.id_persona and obj.id_persona.foto_perfil:
            return obj.id_persona.foto_perfil
        return None


class RespuestaComentarioSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()
    respuestas_anidadas = serializers.SerializerMethodField()
    
    class Meta:
        model = RespuestaComentario
        fields = ['id', 'comentario', 'respuesta_padre', 'id_persona', 'contenido', 
                 'fecha_creacion', 'fecha_actualizacion', 'activo',
                 'autor_nombre', 'autor_foto', 'respuestas_anidadas']
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_autor_nombre(self, obj):
        if obj.id_persona:
            return f"{obj.id_persona.nombres} {obj.id_persona.apellidos}"
        return "Usuario"

    def get_autor_foto(self, obj):
        if obj.id_persona and obj.id_persona.foto_perfil:
            return obj.id_persona.foto_perfil
        return None
    
    def get_respuestas_anidadas(self, obj):
        # Solo recuperar respuestas directas para evitar recursión infinita
        respuestas = obj.respuestas_anidadas.filter(activo=True).order_by('fecha_creacion')
        
        # Para evitar recursión infinita, usamos un serializer sin el campo respuestas_anidadas
        return RespuestaComentarioSimpleSerializer(respuestas, many=True).data

class RespuestaComentarioSimpleSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.SerializerMethodField()
    autor_foto = serializers.SerializerMethodField()
    tiene_respuestas = serializers.SerializerMethodField()
    
    class Meta:
        model = RespuestaComentario
        fields = ['id', 'comentario', 'respuesta_padre', 'id_persona', 'contenido', 
                 'fecha_creacion', 'fecha_actualizacion', 'activo',
                 'autor_nombre', 'autor_foto', 'tiene_respuestas']

    def get_autor_nombre(self, obj):
        if obj.id_persona:
            return f"{obj.id_persona.nombres} {obj.id_persona.apellidos}"
        return "Usuario"

    def get_autor_foto(self, obj):
        if obj.id_persona and obj.id_persona.foto_perfil:
            return obj.id_persona.foto_perfil
        return None
    
    def get_tiene_respuestas(self, obj):
        return obj.respuestas_anidadas.filter(activo=True).exists()

class AnalisisImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisImagen
        fields = '__all__'

class VinculoPacienteCuidadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VinculoPacienteCuidador
        fields = '__all__'

class NutrienteMinutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutrienteMinuta
        fields = '__all__'

class RestriccionAlimentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestriccionAlimentos
        fields = '__all__'

class RestriccionMinutaNutrienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestriccionMinutaNutriente
        fields = '__all__'

class MinutasRestriccionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MinutasRestricciones
        fields = '__all__'

class ForoPersonaSerializer(serializers.ModelSerializer):
    nombre_foro = serializers.SerializerMethodField()
    nombre_persona = serializers.SerializerMethodField()
    
    class Meta:
        model = ForoPersona
        fields = ['id', 'foro', 'persona', 'fecha_suscripcion', 'notificaciones', 'nombre_foro', 'nombre_persona']
    
    def get_nombre_foro(self, obj):
        return obj.foro.nombre if obj.foro else None
    
    def get_nombre_persona(self, obj):
        if obj.persona:
            return f"{obj.persona.nombres} {obj.persona.apellidos}"
        return None

class SeleccionesAnalisisSerializer(serializers.ModelSerializer):
    alimento_nombre = serializers.SerializerMethodField()
    unidad_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = SeleccionesAnalisis
        fields = '__all__'
        
    def get_alimento_nombre(self, obj):
        return obj.alimento_seleccionado.nombre if obj.alimento_seleccionado else None
        
    def get_unidad_nombre(self, obj):
        return obj.unidad_medida.nombre if obj.unidad_medida else None

class AnalisisIngredientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisIngredientes
        fields = '__all__'
