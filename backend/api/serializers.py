from rest_framework import serializers
from .models import (
    Usuario, PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaDia, Receta, IngredienteReceta, DetalleMinuta, ImagenComida, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen
)

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

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

class MinutaNutricionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = MinutaNutricional
        fields = '__all__'

class ComidaDiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComidaDia
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

class ImagenComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenComida
        fields = '__all__'

class RegistroComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroComida
        fields = '__all__'

class CentroMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CentroMedico
        fields = '__all__'

class ConsejoNutricionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsejoNutricional
        fields = '__all__'

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = '__all__'

class PublicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicacion
        fields = '__all__'

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = '__all__'

class RespuestaComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaComentario
        fields = '__all__'

class AnalisisImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisImagen
        fields = '__all__'
