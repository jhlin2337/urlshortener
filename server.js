'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// Set up the database for the project
mongoose.connect(process.env.MONGOLAB_URI);
const shortcutSchema = mongoose.Schema({
  shortcut: Number,
  url: String
});
const Shortcut = mongoose.model('Shortcut', shortcutSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


let availableShortcutId = 0;
app.post("/api/shorturl/new", function(req, res) {
  // If url is prefixed by https:// or http://, cut it to only include the url
  // from www. onward.
  let url = req.body.url;
  if (url.indexOf('//') !== -1) {
  	url = url.slice(url.indexOf('//')+2, url.length);
  }

  // Use a dns lookup to see if the url the user inputted is valid
  dns.lookup(url, function(err, addresses) {
  	// Handles the case where the url submitted does not exist
  	if (err) {
  	  res.json({error: "Invalid URL"});
  	} else { // Handles the case where a valid url is submitted
  	  // Saves the url and a shortcut id into the database
  	  Shortcut.find({url: req.body.url}, function(err, sc) {
  	  	if (err) return console.log(err);

  	  	let shorturl = availableShortcutId;
  	  	if (sc.length > 0) {
  	  	  // If url is already in database, then retrieve the shortcut key for the url
  	  	  shorturl = sc[0]['shortcut'];
  	  	} else {
  	  	  // If url is not in database, create new shortcut using the url and save
  	  	  const sc = new Shortcut({shortcut: shorturl, url: req.body.url});
  	  	  sc.save(function(err, sc) {
  	  		if (err) return console.log(err);
  	  	  });
  	  	  availableShortcutId++;
  	  	}

  	  	// Load json containing submitted url and shortcut url
	  	res.json({
	      original_url: req.body.url,
	      short_url: shorturl
	  	});
  	  });
	}
  });
});

app.get("/api/shorturl/:shortcut", function(req, res) {
  Shortcut.find({shortcut: req.params.shortcut}, function(err, sc) {
  	if (err) {
  	  res.json({error: "No short url found for given input"})
  	} else {
  	  res.redirect(sc[0].url);
  	}
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});