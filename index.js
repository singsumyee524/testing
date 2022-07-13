var express = require('express');

var app = express();

app.engine('html', require('ejs').renderFile);

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

var session = require('express-session');

var path = require('path');

const open = require('open');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
		res.sendFile(__dirname + "/com3105_project.html");
});

app.get('/log', function (req, res) {
	if (req.session.loggedin) {
		res.redirect('/logout');
	} else {
		res.redirect('/login');
    }
});

app.get('/login', function(req, res){
	res.sendFile(__dirname + "/com3105_login.html");
});

app.get('/logout', function (req, res) {
	req.session.destroy();
	res.sendFile(__dirname + "/com3105_project.html");
});

app.post('/login', function(req, res){
	console.log(req.body);	

	var sid = req.body.sid;
	var password = req.body.pwd;

	var mysql = require('mysql');
	
	var connection = mysql.createConnection({
		host: "localhost",
		user: "user99",
		password: "user99",
		database: "com3105"
	});

	if (sid && password) {
		connection.query('SELECT * FROM member WHERE sid = ? AND password = ?', [sid, password], function(err, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.user = sid;
				console.log(results);
				res.redirect('/cart?sid=' + sid);
			} else {
				console.log(results);
				res.send('Incorrect ID and/or password!');
			}
			res.end();
		});
	} else {
		res.end();
	}
});

app.get('/signup', function(req, res){
	res.sendFile(__dirname + "/com3105_signup.html");
});

app.post('/signup', function(req, res){
	console.log(req.body);
	
	var mysql = require('mysql');
	
	var connection = mysql.createConnection({
		host: "localhost",
		user: "user99",
		password: "user99",
		database: "com3105"
	});

	connection.connect(function(err){
		if (err) throw err;

		var sql = "INSERT INTO member (sid, name, email, password) VALUES (";
		sql += "'" + req.body.sID + "', ";
		sql += "'" + req.body.name + "', ";
		sql += "'" + req.body.email + "', ";
		sql += "'" + req.body.pwd + "');";

		console.log(sql);

		connection.query(sql, function(error, result){
			if (error) throw error;

			console.log(result);
			console.log(result.affectedRows);
			if (result.affectedRows > 0) {
				if (req.session.loggedin) {
					req.session.destroy();
					res.sendFile(__dirname + "/com3105_login.html");
				} else {
					res.sendFile(__dirname + "/com3105_login.html");
                }
			} else {
				res.sendFile(__dirname + "/com3105_signup.html");
			}
		});
		connection.end();
	});
});

app.get('/view_catalog', function(req, res) {
	if (req.session.loggedin) {
		res.redirect('/cart');
	} else {
		res.end('Please login to view this page!');
	}
	res.end();
});

app.get('/cart', function(req, res) {
	var sid = req.query.sid;
	var login = req.session.loggedin;
	res.render(__dirname + "/com3105_shopping_cart.html", { sid: sid });
});

app.post('/check_out', function(req, res) {
	console.log(req.body);

	var sid =req.body.sid;
	var date;
	var name = "Yummy&nbsp;Pizza/Chicken&nbsp;Wings/French&nbsp;Fries/Fried&nbsp;Chicken/Burger/Cola";
	var sum = req.body.sum;
	var temp = {p0001: req.body.qty0, p0002: req.body.qty1, p0003: req.body.qty2, p0004: req.body.qty3, p0005: req.body.qty4, p0006: req.body.qty5};
	var pinfo = JSON.stringify(temp);
	

	

	var now = new Date();
	date = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();

	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: "localhost",
		user: "user99",
		password: "user99",
		database: "com3105"
	});

	connection.connect(function(err){
		if (err) throw err;

		var sql =`insert into bills (sid, pinfo, total_price, date) values ('${sid}', '${pinfo}', '${sum}', '${date}');`;
		console.log(sql);

		connection.query(sql, function(error, result){
			if (err) throw err;
			console.log(result);
		});		

		connection.end();
	})

	console.log(sid);

	res.render(__dirname + "/com3105_approval.html", {sid:sid, name:name, pinfo:pinfo, sum:sum, date:date});


});

app.listen(3000, function(){
  console.log('index.js listening to http://127.0.0.1:3000/ or http://localhost:3000/');
});

console.log("End of Program.");