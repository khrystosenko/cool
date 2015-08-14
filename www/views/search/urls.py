from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.search.views',
    url(r'^$', 'filter_by_params', name='search-filter_by_params')
)