import os


def rel(*x):
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), *x)

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com')
)

MANAGERS = ADMINS

DATABASES = {
    'default': {},
}

# Local time zone for this installation.  Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Los_Angeles'

# Language code for this installation.  All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

LOGGING_CONFIG = None

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = False

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = False

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'a9sd86f^*dga88^(*g(egeg86*^*)^faesg^==sf68hf$&d7aj'

STATIC_URL = '/'

STATIC_ROOT = rel('htdocs')

STATICFILES_DIRS = (
    os.path.join(STATIC_ROOT, 'styles/'),
    os.path.join(STATIC_ROOT, 'scripts/'),
    os.path.join(STATIC_ROOT, 'images/')
)

# List of callables that know how to import templates from various sources.

TEMPLATE_LOADERS = (
    'django_jinja.loaders.AppLoader',
    'django_jinja.loaders.FileSystemLoader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.request',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
)

ROOT_URLCONF = 'views.urls'

TEMPLATE_DIRS = (
    rel('views/templates'),
)

INSTALLED_APPS = (
    'django_jinja',
)

DATABASES_INFO_PATH = rel('..', 'db')

DEFAULT_JINJA2_TEMPLATE_EXTENSION = '.html'

ALLOWED_HOSTS = ['*']

try:
    from local_settings import *
except ImportError:
    pass

REGEXP = {
    'username': '^\w+$',
    'email': '([^@|\s]+@[^@]+\.[^@|\s]+)'
}