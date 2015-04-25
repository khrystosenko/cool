#!/usr/bin/env python
import os
import sys

python_path = os.path.join(os.path.join(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir), 'src'), 'python')
sys.path.append(python_path)

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
