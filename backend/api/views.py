from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import (
    Usuario, PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaDia, Receta, IngredienteReceta, DetalleMinuta, ImagenComida, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen
)
from .serializers import (
    UsuarioSerializer, PerfilMedicoSerializer, CondicionPreviaSerializer, UsuarioCondicionSerializer, CategoriaAlimentoSerializer,
    UnidadMedidaSerializer, AlimentoSerializer, PorcionAlimentoSerializer, MinutaNutricionalSerializer, ComidaDiaSerializer,
    RecetaSerializer, IngredienteRecetaSerializer, DetalleMinutaSerializer, ImagenComidaSerializer, RegistroComidaSerializer,
    CentroMedicoSerializer, ConsejoNutricionalSerializer, RolSerializer, UsuarioRolSerializer, PublicacionSerializer,
    ComentarioSerializer, RespuestaComentarioSerializer, AnalisisImagenSerializer
)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class PerfilMedicoViewSet(viewsets.ModelViewSet):
    queryset = PerfilMedico.objects.all()
    serializer_class = PerfilMedicoSerializer
    permission_classes = [AllowAny]

class CondicionPreviaViewSet(viewsets.ModelViewSet):
    queryset = CondicionPrevia.objects.all()
    serializer_class = CondicionPreviaSerializer
    permission_classes = [AllowAny]

class UsuarioCondicionViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCondicion.objects.all()
    serializer_class = UsuarioCondicionSerializer
    permission_classes = [AllowAny]

class CategoriaAlimentoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaAlimento.objects.all()
    serializer_class = CategoriaAlimentoSerializer
    permission_classes = [AllowAny]

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    permission_classes = [AllowAny]

class AlimentoViewSet(viewsets.ModelViewSet):
    serializer_class = AlimentoSerializer
    # Quitar permisos para list y retrieve se mantiene igual

    def get_queryset(self):
        qs = Alimento.objects.all()
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        return qs

    # Permitir el acceso a "list" y "retrieve" sin autenticación
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [AllowAny()]

class PorcionAlimentoViewSet(viewsets.ModelViewSet):
    queryset = PorcionAlimento.objects.all()
    serializer_class = PorcionAlimentoSerializer
    permission_classes = [AllowAny]

class MinutaNutricionalViewSet(viewsets.ModelViewSet):
    queryset = MinutaNutricional.objects.all()
    serializer_class = MinutaNutricionalSerializer
    permission_classes = [AllowAny]

class ComidaDiaViewSet(viewsets.ModelViewSet):
    queryset = ComidaDia.objects.all()
    serializer_class = ComidaDiaSerializer
    permission_classes = [AllowAny]

class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    permission_classes = [AllowAny]

class IngredienteRecetaViewSet(viewsets.ModelViewSet):
    queryset = IngredienteReceta.objects.all()
    serializer_class = IngredienteRecetaSerializer
    permission_classes = [AllowAny]

class DetalleMinutaViewSet(viewsets.ModelViewSet):
    queryset = DetalleMinuta.objects.all()
    serializer_class = DetalleMinutaSerializer
    permission_classes = [AllowAny]

class ImagenComidaViewSet(viewsets.ModelViewSet):
    queryset = ImagenComida.objects.all()
    serializer_class = ImagenComidaSerializer
    permission_classes = [AllowAny]

class RegistroComidaViewSet(viewsets.ModelViewSet):
    queryset = RegistroComida.objects.all()
    serializer_class = RegistroComidaSerializer
    permission_classes = [AllowAny]

class CentroMedicoViewSet(viewsets.ModelViewSet):
    queryset = CentroMedico.objects.all()
    serializer_class = CentroMedicoSerializer
    permission_classes = [AllowAny]

class ConsejoNutricionalViewSet(viewsets.ModelViewSet):
    queryset = ConsejoNutricional.objects.all()
    serializer_class = ConsejoNutricionalSerializer
    permission_classes = [AllowAny]

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [AllowAny]

class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer
    permission_classes = [AllowAny]

class PublicacionViewSet(viewsets.ModelViewSet):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [AllowAny]

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    permission_classes = [AllowAny]

class RespuestaComentarioViewSet(viewsets.ModelViewSet):
    queryset = RespuestaComentario.objects.all()
    serializer_class = RespuestaComentarioSerializer
    permission_classes = [AllowAny]

class AnalisisImagenViewSet(viewsets.ModelViewSet):
    queryset = AnalisisImagen.objects.all()
    serializer_class = AnalisisImagenSerializer
    permission_classes = [AllowAny]
