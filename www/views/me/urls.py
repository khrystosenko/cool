from django.conf.urls import patterns, url

urlpatterns = patterns('views.me.views',
    url(r'^streams/$', 'get_user_streams', name='me-streams'),
)