const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Users {
	findOne = async username => {
		const query = "SELECT * FROM users WHERE username = $1";
		return await db.query(query, [username]);
	};

	insertOne = async (username, password) => {
		const query =
			"INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await db.query(query, [username, hashedPassword]);
		return result.rows[0];
	};

	// Check if login details are valid by comparing encrypted passwords
	verifyPassword = async (password, user) => {
		try {
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) return { id: user.id, username: user.username };
			return null;
		} catch (err) {
			console.error(`Login error: ${err.message}`);
			throw err;
		}
	};

	// Sign the JWT
	createToken = user => {
		return jwt.sign(
			{
				subject: user.id,
				username: user.username,
				issuer: "api.wired",
				audience: "api.wired",
			},
			process.env.REACT_APP_JWT_SECRET,
			{ algorithm: "HS256", expiresIn: "1h" }
		);
	};
}

module.exports = new Users();
