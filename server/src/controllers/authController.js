import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const cookieOptions = {
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
sameSite: 'lax',
maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};


export const register = async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });


const existing = await User.findOne({ email });
if (existing) return res.status(409).json({ message: 'Email already in use' });


const hash = await bcrypt.hash(password, 10);
const user = await User.create({ name, email, password: hash });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
	res.cookie('token', token, cookieOptions);
	res.json({ id: user._id, name: user.name, email: user.email, token });
} catch (e) {pageYOffset
console.error(e);
res.status(500).json({ message: 'Server error' });
}
};


export const login = async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });


const ok = await bcrypt.compare(password, user.password);
if (!ok) return res.status(401).json({ message: 'Invalid credentials' });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
	res.cookie('token', token, cookieOptions);
	res.json({ id: user._id, name: user.name, email: user.email, token });
} catch (e) {
console.error(e);
res.status(500).json({ message: 'Server error' });
}
};


export const me = async (req, res) => {
try {
const user = await User.findById(req.user.id).select('name email');
res.json(user);
} catch (e) {
res.status(500).json({ message: 'Server error' });
}
};


export const logout = async (_req, res) => {
res.clearCookie('token');
res.json({ message: 'Logged out' });
};