import requests

ENDPOINT = "https://api.testcruddur.click"



def test_call_health_endpoint():
    response = requests.get(ENDPOINT + "/api/health-check")
    assert response.status_code == 200
    pass

def test_call_search_endpoint_with_params():
    params = {'term': 'test'}
    response = requests.get(ENDPOINT + "/api/activities/search",params = params)
    assert response.status_code == 200
    pass

def test_call_search_endpoint():
    response = requests.get(ENDPOINT + "/api/activities/search")
    data = response.status_code
    assert data == 422
    pass
