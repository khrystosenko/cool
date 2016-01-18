from ConfigParser import ConfigParser

from django.conf import settings

_config = None


def get_config():
	global _config
	if _config is None:
		_config = ConfigParser()
		_config.read(settings.CONFIG_INI)

	return _config