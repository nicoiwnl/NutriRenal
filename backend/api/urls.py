from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    UsuarioViewSet, PerfilMedicoViewSet, CondicionPreviaViewSet, UsuarioCondicionViewSet, CategoriaAlimentoViewSet,
    UnidadMedidaViewSet, AlimentoViewSet, PorcionAlimentoViewSet, MinutaNutricionalViewSet, ComidaDiaViewSet, RecetaViewSet,
    IngredienteRecetaViewSet, DetalleMinutaViewSet, ImagenComidaViewSet, RegistroComidaViewSet, CentroMedicoViewSet,
    ConsejoNutricionalViewSet, RolViewSet, UsuarioRolViewSet, PublicacionViewSet, ComentarioViewSet, RespuestaComentarioViewSet,
    AnalisisImagenViewSet
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'perfil-medico', PerfilMedicoViewSet)
router.register(r'condiciones-previas', CondicionPreviaViewSet)
router.register(r'usuario-condiciones', UsuarioCondicionViewSet)
router.register(r'categorias-alimento', CategoriaAlimentoViewSet)
router.register(r'unidades-medida', UnidadMedidaViewSet)
router.register(r'alimentos', AlimentoViewSet, basename="alimentos")
router.register(r'porciones-alimento', PorcionAlimentoViewSet)
router.register(r'minutas-nutricionales', MinutaNutricionalViewSet)
router.register(r'comidas-dia', ComidaDiaViewSet)
router.register(r'recetas', RecetaViewSet)
router.register(r'ingredientes-receta', IngredienteRecetaViewSet)
router.register(r'detalles-minuta', DetalleMinutaViewSet)
router.register(r'imagenes-comida', ImagenComidaViewSet)
router.register(r'registros-comida', RegistroComidaViewSet)
router.register(r'centros-medicos', CentroMedicoViewSet)
router.register(r'consejos-nutricionales', ConsejoNutricionalViewSet)
router.register(r'roles', RolViewSet)
router.register(r'usuario-roles', UsuarioRolViewSet)
router.register(r'publicaciones', PublicacionViewSet)
router.register(r'comentarios', ComentarioViewSet)
router.register(r'respuestas-comentarios', RespuestaComentarioViewSet)
router.register(r'analisis-imagenes', AnalisisImagenViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
