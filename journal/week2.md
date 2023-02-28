# Week 2 — Distributed Tracing

## Rollbar 

### Installation

Update requirements.txt to add dependency

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
