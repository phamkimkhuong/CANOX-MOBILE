import json

with open('c:/EBAY/temp_swagger.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find components/schemas/CheckoutPreviewRequest
schema = data.get('components', {}).get('schemas', {}).get('CheckoutPreviewRequest', {})
if schema:
    print(json.dumps(schema, indent=2))
else:
    print("CheckoutPreviewRequest not found in schemas")

# Find /api/v1/cart/checkout POST requestBody
path = data.get('paths', {}).get('/api/v1/cart/checkout', {}).get('post', {})
if path:
    content = path.get('requestBody', {}).get('content', {}).get('application/json', {}).get('schema', {})
    print("\nAPI Request Body Schema:")
    print(json.dumps(content, indent=2))
