from roomit.db import feedback

def create(username, email, text):
	data = feedback.create(username, email, text)
	return data