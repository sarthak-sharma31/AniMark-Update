import jwt from 'jsonwebtoken';

const attachUser = (req, res, next) => {
	const token = req.cookies.token;

	if (!token) {
		res.locals.isAuthenticated = false;
		return next();
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		res.locals.isAuthenticated = true;
		res.locals.user = decoded;
	} catch (err) {
		res.locals.isAuthenticated = false;
	}

	next();
};

export default attachUser;
