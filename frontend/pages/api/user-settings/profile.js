import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;
  
  // Get the token from the request headers
  const token = req.headers.authorization;
  
  console.log('Profile API called with method:', method);
  console.log('Authorization header:', token);
  
  // Set the Django API URL with fallback
  const DJANGO_API_URL = process.env.DJANGO_API_URL || 'https://atb-tracker.onrender.com';
  
  try {
    let response;
    
    if (method === 'GET') {
      // Fetch profile data
      console.log('Making GET request to Django...');
      response = await fetch(`${DJANGO_API_URL}/api/user-settings/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });
      console.log('Django response status:', response.status);
    } else if (method === 'PATCH') {
      // Update profile data
      // Detect if request is multipart/form-data
      const contentType = req.headers['content-type'] || req.headers['Content-Type'];
      let fetchOptions;
      if (contentType && contentType.includes('multipart/form-data')) {
        // Remove content-type header so fetch sets the correct boundary
        // Forward the original Content-Type (including boundary) to Django
        const headers = {
          'Authorization': token,
          'Content-Type': contentType,
        };
        // Use raw-body to read the body
        const rawBody = await getRawBody(req);
        fetchOptions = {
          method: 'PATCH',
          headers,
          body: rawBody,
        };

      } else {
        // Default to JSON body
        fetchOptions = {
          method: 'PATCH',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        };
      }
      response = await fetch(`${DJANGO_API_URL}/api/user-settings/profile/`, fetchOptions);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const data = await response.json();
    console.log('Django response data:', data);
    
    if (!response.ok) {
      console.log('Django request failed with status:', response.status);
      return res.status(response.status).json(data);
    }
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 