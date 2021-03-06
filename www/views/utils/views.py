import json

from django.http import HttpResponse


class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        output = json.dumps(data)
        super(JSONResponse, self).__init__(output, mimetype='application/json',
                                           **kwargs)