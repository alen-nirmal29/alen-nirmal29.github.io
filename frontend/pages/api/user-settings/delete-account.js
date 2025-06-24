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
    const response = await fetch(`