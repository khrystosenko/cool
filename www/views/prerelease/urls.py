from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.prerelease.views',
    url(r'^$', 'prerelease', name='prerelease')
)
