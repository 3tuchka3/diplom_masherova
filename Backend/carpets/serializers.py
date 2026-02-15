from rest_framework import serializers
from .models import Carpet

class CarpetSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Carpet
        fields = ['id', 'design', 'color', 'palette', 'size', 'extra', 'image', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None