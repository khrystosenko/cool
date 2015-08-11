from django.views.generic import TemplateView
from django.conf.urls import patterns, include, url
from django.conf import settings
from django.conf.urls.static import static

basepatterns = patterns('views.views',
    url(r'^$', 'index', name='index'),
)

urlpatterns = basepatterns + patterns('',
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    url(r'^sitemap\.xml$', TemplateView.as_view(template_name='sitemap.xml', content_type='text/xml')),
    
    url(r'^auth/', include('views.auth.urls', 'auth')),
    url(r'^room/', include('views.room.urls', 'room')),
    url(r'^feedback/', include('views.feedback.urls', 'feedback')),
)

if getattr(settings, 'DJANGO_DEV_SERVER', False):
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)