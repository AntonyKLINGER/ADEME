export default function handler(req, res) {
    res.setHeader('Set-Cookie', 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    res.status(200).json({ status: 'success' })
  }