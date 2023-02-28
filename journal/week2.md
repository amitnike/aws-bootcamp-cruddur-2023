# Week 2 — Distributed Tracing

## Honeycomb

### Installation and instrumentation


```
update Requirements.txt

opentelemetry-api 
opentelemetry-sdk 
opentelemetry-exporter-otlp-proto-http 
opentelemetry-instrumentation-flask 
opentelemetry-instrumentation-requests


```

### Application code changes 

```
imports in app.py

# Honeycomb updates
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Initialize tracing and an exporter that can send data to Honeycomb
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Honeycomb Initialize automatic instrumentation with Flask
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

```
### update docker-compose.yml to env variables

```
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io"
      OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=${HONEYCOMB_API_KEY}"
      OTEL_SERVICE_NAME: "backend_flask"
      
```

### Update service endpoint to set trace and span..with customer attributes

```
from opentelemetry import trace

with tracer.start_as_current_span("home-activities-mock-data"):
      span = trace.get_current_span();
      now = datetime.now(timezone.utc).astimezone()
      span.set_attribute("app.now", now.isoformat())
      
      //existing serivce logic
      
 
 span.set_attribute("app.results_length",len(results))

```

### View the traces on HoneyComb UI

![image](https://user-images.githubusercontent.com/18515029/221756901-4c85ed13-c2f8-4f0f-943b-362642447de6.png)

![image](https://user-images.githubusercontent.com/18515029/221756996-46f88850-6d3e-43ab-b419-09af0aff4015.png)

![image](https://user-images.githubusercontent.com/18515029/221758317-8dd3fc91-0ba0-4574-b863-7e82e6c5ffa9.png)



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


## AWS CloudWatch

### Add dependency

```
watchtower

```
### Update application code

```
app.py changes 

#watchTower..cloudwatch logs
import watchtower
import logging
from time import strftime

# Configuring Logger to Use CloudWatch
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
cw_handler = watchtower.CloudWatchLogHandler(log_group='cruddur')
LOGGER.addHandler(console_handler)
LOGGER.addHandler(cw_handler)
LOGGER.info("inside app.oy message")

@app.after_request
def after_request(response):
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    LOGGER.error('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
    return response
    
Application service changes

logger.info("HomeAHello Cloudwatch! from  /api/activities/homectivities")

```
### Check cloud watch logs

![image](https://user-images.githubusercontent.com/18515029/221756327-6b73f252-173d-42cb-a1fc-1a4d3af6cfff.png)


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
