from datetime import datetime, timedelta, timezone
# from aws_xray_sdk.core import xray_recorder

class UserActivities:
  def run(user_handle):
    # x-ray segment
    # segment = xray_recorder.begin_segment('user_activities')
    # subsegment = xray_recorder.begin_subsegment('user_activities_subsegment')
    model = {
      'errors': None,
      'data': None
    }

    # now = datetime.now(timezone.utc).astimezone()

    # #segment.put_metadata('key', dict, 'namespace')
    # subsegment.put_annotation('key', 'value')

    if user_handle == None or len(user_handle) < 1:
      model['errors'] = ['blank_user_handle']
    else:
      now = datetime.now()
      results = [{
        'uuid': '248959df-3079-4947-b847-9e0892d1bab4',
        'handle':  'Andrew Brown',
        'message': 'Cloud is fun!',
        'created_at': (now - timedelta(days=1)).isoformat(),
        'expires_at': (now + timedelta(days=31)).isoformat()
      }]
      model['data'] = results
      # xray_recorder.end_subsegment()
     # xray_recorder.end_segment()
    return model