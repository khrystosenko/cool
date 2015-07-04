from django.conf.urls import patterns, include, url

urlpatterns = patterns('views.feedback.views',
    url(r'^$', 'create', name='feedback-create')
)