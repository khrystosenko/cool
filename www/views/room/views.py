from django.shortcuts import redirect
from django.template.response import TemplateResponse

def create(request):
	if request.method == 'POST':
		return redirect('room-view')

	return TemplateResponse(request, 'room/create.html')

def view(request):
	return TemplateResponse(request, 'room/view.html')