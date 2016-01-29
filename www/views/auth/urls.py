from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.auth.views',
    url(r'^facebook/$', 'facebook', name='facebook'),
)