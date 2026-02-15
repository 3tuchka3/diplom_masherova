import os
from django.core.management.base import BaseCommand
from carpets.models import Carpet


class Command(BaseCommand):
    help = 'Парсит названия файлов .BMP и импортирует ковры'

    def handle(self, *args, **options):
        folder_path = 'media/carpets/'

        # Проверяем, существует ли папка
        if not os.path.exists(folder_path):
            self.stdout.write(self.style.ERROR(f'Папка {folder_path} не найдена!'))
            return

        for filename in os.listdir(folder_path):
            # Проверяем расширение без учета регистра (.bmp, .BMP, .Bmp)
            if not filename.lower().endswith('.jpg'):
                continue

            # Убираем расширение и приводим всё к английской 'x' для парсинга
            name_normalized = os.path.splitext(filename)[0].lower()
            name_normalized = name_normalized.replace('х', 'x')  # Замена русской 'х' на английскую

            parts = name_normalized.split('x')

            # 1. Первый блок (Рисунок + Колорит)
            # Например: 2530c3 -> рисунок 2530, колорит c3
            first_block = parts[0]
            design = first_block[:-2]
            color = first_block[-2:]

            # 2. Собираем размер (ищем блоки, состоящие только из цифр)
            # Идем с конца, так как размеры всегда в конце
            size_list = []
            for p in reversed(parts):
                if p.isdigit():
                    size_list.insert(0, p)
                elif size_list:  # Если встретили не цифру, а размер уже начали собирать - стоп
                    break
            size = "x".join(size_list)

            # 3. Разбираем середину (палитра и экстра)
            # Исключаем первый блок и блоки размеров
            middle_parts = [p for p in parts[1:] if p not in size_list]
            palette = ""
            extra = ""

            for p in middle_parts:
                if len(p) == 1:
                    extra = p  # Например 'r'
                elif len(p) == 2:
                    palette = p  # Например 'vs'

            # 4. Сохранение
            # Используем update_or_create, чтобы если данные изменились, они обновились
            obj, created = Carpet.objects.update_or_create(
                image=f'carpets/{filename}',
                defaults={
                    'design': design,
                    'color': color,
                    'palette': palette,
                    'size': size,
                    'extra': extra
                }
            )

            status = "Импортирован" if created else "Обновлен"
            self.stdout.write(self.style.SUCCESS(f'{status}: {filename} -> {design}|{color}|{size}'))

        self.stdout.write(self.style.SUCCESS('--- Импорт завершен ---'))