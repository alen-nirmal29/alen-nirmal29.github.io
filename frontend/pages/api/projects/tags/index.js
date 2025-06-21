export default async function handler(req, res) {
  const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000";
  const url = `${DJANGO_API_URL}/api/projects/tags/`;

  // Forward the Authorization header if present
  const headers = { "Content-Type": "application/json" };
  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization;
  }

  const options = {
    method: req.method,
    headers,
  };
  if (req.method !== "GET") options.body = JSON.stringify(req.body);

  const response = await fetch(url, options);
  const data = await response.json();
  res.status(response.status).json(data);
} 