# Week 2 — Distributed Tracing

## AWS X-Ray

Update requirements.txt to add dependency and install using 

```
aws-xray-sdk

pip install -r requirements.txt

```
Update docker-compose.yml

```
ENV Variable 

      AWS_XRAY_URL: "*4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}*"
      AWS_XRAY_DAEMON_ADDRESS: "xray-daemon:2000"
      
X-ray Daemon

  xray-daemon:
    image: "amazon/aws-xray-daemon"
    environment:
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      AWS_REGION: "ap-south-1"
    command:
      - "xray -o -b xray-daemon:2000"
    ports:
      - 2000:2000/udp

```
### Update application code

```
update app.py

# AWS X-ray Instrumentation
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.ext.flask.middleware import XRayMiddleware

#Initialization
xray_url = os.getenv("AWS_XRAY_URL")
xray_recorder.configure(service='backend-flask', dynamic_naming=xray_url)

#AWS X-ray
XRayMiddleware(app, xray_recorder)

update service endpoint to add logging with segments/subsegments

from aws_xray_sdk.core import xray_recorder

    subsegment = xray_recorder.begin_subsegment('user_activities_subsegment')
    model = {
      'errors': None,
      'data': None
    }

    now = datetime.now(timezone.utc).astimezone()

    #segment.put_metadata('key', dict, 'namespace')
    subsegment.put_annotation('key', 'value')
    
    
    xray_recorder.end_subsegment()

```

### Create AWS group and sampling rules and view the logs

```
aws xray create-group \
   --group-name "Cruddur" \
   --filter-expression "service(\"backend-flask\")"

aws xray create-sampling-rule --cli-input-json file://aws/json/x-ray.json

```
### Capture segments and subsegments

![image](https://user-images.githubusercontent.com/18515029/221754108-48f059d7-d84d-43fe-bca5-217fee3910fb.png)


## Rollbar 

### Installation

Update requirements.txt to add dependency and install them

```
blinker
rollbar
```

Set the environemnt variable with access token from rollbar UI as well as update docker-compose.yml

```
ROLLBAR_ACCESS_TOKEN: "${ROLLBAR_ACCESS_TOKEN}"
```

Update app.py to import the rollbar and initialize it

```

import rollbar
import rollbar.contrib.flask
from flask import got_request_exception

rollbar_access_token = os.getenv('ROLLBAR_ACCESS_TOKEN')
@app.before_first_request
def init_rollbar():
    """init rollbar module"""
    rollbar.init(
        # access token
        rollbar_access_token,
        # environment name
        'production',
        # server root directory, makes tracebacks prettier
        root=os.path.dirname(os.path.realpath(__file__)),
        # flask already sets up logging
        allow_logging_basic_config=False)

    # send exceptions from `app` to rollbar, using flask's signal system.
    got_request_exception.connect(rollbar.contrib.flask.report_exception, app)

```

Introduce error in any endpoint..like update the return statement


### Viewing errors on UI

![image](https://user-images.githubusercontent.com/18515029/221750557-cb4b8221-32ed-4f2a-9bbb-e12536b0c2f3.png)
