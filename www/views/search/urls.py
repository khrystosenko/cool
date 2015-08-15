from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.search.views',
    url(r'^$', 'filter_by_params', name='search-filter_by_params'),
    url(r'^games/top/$', 'get_top_games', name='search-get_top_games'),
    url(r'^games/$', 'get_games_like', name='search-get_games_like'),
    url(r'^platforms/top/$', 'get_top_platforms', name='search-get_top_platforms'),
)