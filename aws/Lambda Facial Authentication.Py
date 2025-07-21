import boto3
import json
import urllib.parse

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='ap-south-1')
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')

dynamodbTableName = 'Employeee'
employeeTable = dynamodb.Table(dynamodbTableName)
bucketName = 'visitors-images-store'
collectionId = 'employees'

def lambda_handler(event, context):
    #  Handle CORS safely
    headers = event.get('headers') or {}
    origin = headers.get('origin') or headers.get('Origin') or 'http://localhost:5173'
    
    # Optional: restrict allowed origins
    allowed_origins = ['http://localhost:5173']
    if origin not in allowed_origins:
        origin = 'http://localhost:5173'  # or return 403 if you want to deny

    #  Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return response_with_status(200, {'message': 'CORS preflight success'}, origin)

    try:
        print(" Event:", json.dumps(event if event else {}, indent=2))

        http_method = event.get('httpMethod', '')
        rawKey = None

        if http_method == 'POST':
            body = json.loads(event['body'] or '{}')
            rawKey = body.get('imageKey')

        elif http_method == 'GET':
            rawKey = event.get('queryStringParameters', {}).get('imageKey')

        else:
            return response_with_status(405, {'message': 'Method not allowed'}, origin)

        if not rawKey:
            return response_with_status(400, {'message': 'Missing imageKey'}, origin)

        objectKey = urllib.parse.unquote_plus(rawKey)

        # Ensure Rekognition Collection Exists
        try:
            rekognition.describe_collection(CollectionId=collectionId)
        except rekognition.exceptions.ResourceNotFoundException:
            return response_with_status(400, {'message': 'Rekognition collection not found'}, origin)

        rekog_response = rekognition.search_faces_by_image(
            CollectionId=collectionId,
            Image={'S3Object': {'Bucket': bucketName, 'Name': objectKey}},
            MaxFaces=1,
            FaceMatchThreshold=75
        )

        if rekog_response.get('FaceMatches'):
            faceMatch = rekog_response['FaceMatches'][0]
            rekognitionId = faceMatch['Face']['FaceId']
            confidence = faceMatch['Similarity']

            dynamo_response = employeeTable.get_item(Key={'rekognitionid': rekognitionId})

            if 'Item' in dynamo_response:
                employee = dynamo_response['Item']
                return response_with_status(200, {
                    'message': 'Match found',
                    'employee': {
                        'firstName': employee.get('firstName', 'Unknown'),
                        'lastName': employee.get('lastName', 'Unknown'),
                        'email': employee.get('email', 'N/A'),
                        'confidence': round(confidence, 2)
                    }
                }, origin)
            else:
                return response_with_status(404, {'message': 'Face recognized but not in DB'}, origin)
        else:
            return response_with_status(401, {'message': 'Face not recognized'}, origin)

    except Exception as e:
        print(" Exception:", str(e))
        return response_with_status(500, {'message': 'Internal server error', 'error': str(e)}, origin)

def response_with_status(status_code, body_dict, origin='*'):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body_dict)
    }
