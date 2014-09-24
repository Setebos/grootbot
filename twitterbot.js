var restclient = require('node-restclient');
var Twit = require('twit');
var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');

var app = express();
app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

var db = mongoose.connection;
var grootSchema = new mongoose.Schema({
  title: String,
  value: Number
});
var GrootDb = mongoose.model('GrootDb', grootSchema);
// mongoose.connect('mongodb://localhost/twitterbot');
mongoose.connect('mongodb://Groot:XaS0tU4mYOFAzjN0snnL@kahana.mongohq.com:10041/TwitterBot');

var T = new Twit({
  consumer_key:         '9iKX63YZHDiorDc7fiSjKYz6o',
  consumer_secret:      'Fm6TtrCr0rnFIaJFgD6yj5C4RKa5KI4AJEHz59sfKgb7iHZGa7',
  access_token:         '2816969028-b1ic2XQIbqZIm2uOyWIKbodR7gAes8TlVnx7AW5',
  access_token_secret:  'yFdzkoTTc9aUu8cK2U0x4cyk5ICeSZSXZnFFA1mKzySHr'
});

var max_id = null;
GrootDb.findOne({ title: 'max_id' }, function(err, reply) {
  if (err) return console.error(err);
  max_id = reply.value;
});

function reply() {
  T.get('statuses/mentions_timeline', {since_id: max_id}, function(e, r) {
    if(r != undefined) {
      for(var i = 0 ; i < r.length ; i++) {
          var message = '@' + r[i].user.screen_name + ' ' + groot();
          T.post('statuses/update', { status: message}, function(err, reply) {
            console.log("message error: " + err);
            console.log("Sent a message");
          });
          if(max_id < r[i].id) {
            max_id = r[i].id;
            GrootDb.update({title: 'max_id'}, {value: max_id}, function(error, result) {
              console.log("database error: " + error);
            });
          }
      }
    }
  });
  console.log(max_id);
}

function groot() {
  var groots = [
    "I am Groot.",
    "I am Groot...",
    "I am Groot !",
    "I am Groot ?"
  ];

  var result = groots[Math.floor(Math.random() * groots.length)];

  return result;
}

setInterval(function() {
  try {
    reply();
  }
 catch (e) {
    console.log(e);
  }
},120000);