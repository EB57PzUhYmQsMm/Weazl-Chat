const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
var db = sqlite.Database('./databases/users.db');
(async () => {
    db = await sqlite.open({
      filename: './databases/users.db',
      driver: sqlite3.cached.Database
    });
})()

async function registerUser(username, password, confirmPassword){
	if (!(userNameExists(username))){
		if (password == confirmPassword){
			const result = await db.run(
				'INSERT INTO users (userId, username, password) VALUES (?, ?, ?)',
				null, 
				username, 
				password
			)
		}
	}
}
// TODO: Select the first result of that username, return true if found, return false if it doesn't exist
function userNameExists(username){
	return true;	
}

async function loginUser(username, password){
	const result = await db.get(
		'SELECT * FROM users WHERE username = ? AND password = ?', 
		[username, password],
		(err, row) => {
			if (err) {
				return false;
			}
			if (row.name == username && row.password == password){
				return true;
			}
			else{
				return false;
			}
		}
	});
}

async function setUp(){
	const result = await db.run('CREATE TABLE users(userId INTEGER PRIMARY KEY, username text NOT NULL, password text NOT NULL);', function(err){
		if (err){
			return console.log(err.message);
		}
			console.log("created database!");
	});
}
