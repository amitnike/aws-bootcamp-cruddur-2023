# Week X — Final Submission

## Sync tool for Static website hosting continued ...

Script to prepare the static build and sync with cloudfront

./bin/frontend/static-build

```
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
FRONTEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $FRONTEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
echo $(pwd)
PROJECT_PATH=$(pwd)
FRONTEND_REACT_JS_PATH="$PROJECT_PATH/frontend-react-js"

cd $FRONTEND_REACT_JS_PATH


REACT_APP_BACKEND_URL="https://api.testcruddur.click" \
REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
REACT_APP_AWS_USER_POOLS_ID="ap-south-1_HvWBed4Mc" \
REACT_APP_CLIENT_ID="4a930ki8237113j3847gpuov0n" \
npm run build

```
./bin/frontend/sync

```

#!/usr/bin/env ruby

require 'aws_s3_website_sync'
require 'dotenv'

env_path = "/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/bin/frontend/sync.env"
Dotenv.load(env_path)

puts "== configuration"
puts "aws_default_region:   ap-south-1"
puts "s3_bucket:            testcruddur.click"
puts "distribution_id:      ******"
puts "build_dir:            /home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/frontend-react-js/build"

changeset_path = '/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/tmp/sync-changeset.json'
changeset_path = changeset_path.sub(".json","-#{Time.now.to_i}.json")

puts "output_changset_path: #{changeset_path}"
puts "auto_approve:         false"

puts "sync =="
AwsS3WebsiteSync::Runner.run(
  aws_access_key_id:     '*******',
  aws_secret_access_key: '*********',
  aws_default_region:    'ap-south-1',
  s3_bucket:             'testcruddur.click',
  distribution_id:       '******',
  build_dir:             '/home/amit/Documents/git/cruddur-app-2023/aws-bootcamp-cruddur-2023/frontend-react-js/build',
  output_changset_path:  changeset_path,
  auto_approve:          'false',
  silent: "ignore,no_change",
  ignore_files: [
    'stylesheets/index',
    'android-chrome-192x192.png',
    'android-chrome-256x256.png',
    'apple-touch-icon-precomposed.png',
    'apple-touch-icon.png',
    'site.webmanifest',
    'error.html',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'robots.txt',
    'safari-pinned-tab.svg'
  ]
)
```