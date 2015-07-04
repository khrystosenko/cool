from ..utils import feedback, request
from ..utils.views import JSONResponse


def create(req):	
    resp = feedback.create(request.get_params(req))
    return JSONResponse(resp)