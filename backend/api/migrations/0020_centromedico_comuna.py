# Generated by Django 5.1.6 on 2025-03-21 03:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_receta_tipo_receta'),
    ]

    operations = [
        migrations.AddField(
            model_name='centromedico',
            name='comuna',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
