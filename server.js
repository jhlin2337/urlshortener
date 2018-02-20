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

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

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

app.post("/api/shorturl/new", function(req, res) {
  // If url is prefixed by https:// or http://, cut it to only include the url
  // from www. onward.
  let url = req.body.url;
  if (url.indexOf('//') !== -1) {
  	url = url.slice(url.indexOf('//')+2, url.length);
  }

  // Use a dns lookup to see if the url the user inputted is valid
  dns.lookup(url, function(err, addresses) {
  	if (err) {
  	  res.json({error: "Invalid URL"});
  	} else {
	  res.json({
	    original_url: req.body.url,
	    short_url: 1
	  });
	}
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});