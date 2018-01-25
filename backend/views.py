
from django.views import View
from django.http import JsonResponse


class Run(View):

    def get(self, request, *args, **kwargs):
        print(request.GET)
        return JsonResponse({'result': 'ok'})

    def post(self, request, *args, **kwargs):
        print(request.body)
        return JsonResponse({'result': 'ok'})
