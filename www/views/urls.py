from django.conf.urls import include, url

urlpatterns = (
    url(r'^room/', include('views.room.urls')),
)