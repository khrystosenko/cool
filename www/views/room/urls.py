from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.room.views',
    url(r'^create/$', 'create', name='room-create'),
    url(r'^(?P<room_name>[\w-]{1,36})$', 'view', name='room-view')
)
