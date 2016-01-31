from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.room.views',
    url(r'^add/$', 'add', name='room-add'),
    url(r'^(?P<room_name>[\w-]{1,36})$', 'view', name='room-view')
)
