from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.room.views',
    url(r'^create/$', 'create', name='room-create'),
    url(r'^$', 'view', name='room-view')
)