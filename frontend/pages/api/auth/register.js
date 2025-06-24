export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ error: 'First name, email, and password are required' });
    }

    // Set the Django API URL with fallback
    const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://atb-tracker.onrender.com';

    // Forward the request to Django backend
    const response = await fetch(`${DJANGO_API_URL}/api/users/members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        first_name, 
        last_name: last_name || '', 
        email, 
        password 
      })
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 