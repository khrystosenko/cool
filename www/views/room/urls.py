from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.room.views',
    url(r'^$', 'index', name='index'),
)