import os


def list_files(startpath):
    with open('../../Backend/project_structure.txt', 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(startpath):
            # Исключаем служебные папки, чтобы файл не был огромным
            dirs[:] = [d for d in dirs if d not in ['.git','.idea', '.venv','.Lib','.media','.Scripts', '__pycache__', '.idea']]

            level = root.replace(startpath, '').count(os.sep)
            indent = ' ' * 4 * (level)
            f.write(f'{indent}{os.path.basename(root)}/\n')
            subindent = ' ' * 4 * (level + 1)
            for file in files:
                f.write(f'{subindent}{file}\n')


if __name__ == "__main__":
    list_files('.')