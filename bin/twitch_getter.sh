#!/bin/sh
export PYTHONPATH=$PYTHONPATH:/var/www/cool/src/python/:/var/www/cool/www/
export DJANGO_SETTINGS_MODULE=settings
python -W ignore /var/www/cool/src/python/roomit/bin/twitch_getter.py
