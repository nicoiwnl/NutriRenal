# Generated by Django 5.1.6 on 2025-03-21 01:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_rename_informacion_nutricional_receta_materiales_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='receta',
            name='bajo_en_fosforo',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='receta',
            name='bajo_en_potasio',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='receta',
            name='bajo_en_proteinas',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='receta',
            name='bajo_en_sodio',
            field=models.BooleanField(default=False),
        ),
    ]
