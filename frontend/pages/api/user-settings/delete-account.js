export default async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get the token from the request headers
  const token = req.headers.authorization;
  
  // Set the Django API URL with fallback
  const DJANGO_API_URL = process.env.DJANGO_API_URL || 'https://atb-tracker.onrender.com';
  
  try {
    const response = await fetch(`${DJANGO_API_URL}/api/user-settings/delete-account/`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Delete account API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}