from django.contrib import admin
from .models import (
    Usuario, PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaDia, Receta, IngredienteReceta, DetalleMinuta, ImagenComida, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen
)

admin.site.register(Usuario)
admin.site.register(PerfilMedico)
admin.site.register(CondicionPrevia)
admin.site.register(UsuarioCondicion)
admin.site.register(CategoriaAlimento)
admin.site.register(UnidadMedida)
admin.site.register(Alimento)
admin.site.register(PorcionAlimento)
admin.site.register(MinutaNutricional)
admin.site.register(ComidaDia)
admin.site.register(Receta)
admin.site.register(IngredienteReceta)
admin.site.register(DetalleMinuta)
admin.site.register(ImagenComida)
admin.site.register(RegistroComida)
admin.site.register(CentroMedico)
admin.site.register(ConsejoNutricional)
admin.site.register(Rol)
admin.site.register(UsuarioRol)
admin.site.register(Publicacion)
admin.site.register(Comentario)
admin.site.register(RespuestaComentario)
admin.site.register(AnalisisImagen)
