#!/bin/sh
export PYTHONPATH=$PYTHONPATH:/home/vovaminof/roomit/src/python/:/home/vovaminof/roomit/www/
export DJANGO_SETTINGS_MODULE=settings
python -W ignore /home/vovaminof/roomit/src/python/roomit/bin/twitch_getter.py
