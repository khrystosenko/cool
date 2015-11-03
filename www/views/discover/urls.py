from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.discover.views',
    url(r'^$', 'index', name='discover-index')
)
