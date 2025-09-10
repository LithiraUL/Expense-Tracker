import jwt from 'jsonwebtoken';


export const requireAuth = (req, res, next) => {
	let token = req.cookies?.token;
	// Also check Authorization header for Bearer token
	if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) return res.status(401).json({ message: 'Not authenticated' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: payload.id };
		next();
	} catch (e) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};