from django.http import HttpResponse
from roomit.handlers.test import test_handler

def index(request):
	return HttpResponse(test_handler())