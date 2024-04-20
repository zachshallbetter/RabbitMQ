#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'logs'; // Name of the exchange
    var msg = process.argv.slice(2).join(' ') || "info: Hello World!";

    ch.assertExchange(ex, 'fanout', {durable: false}); // Make exchange durable
    ch.prefetch(1); // Fair Dispatch: Do not give more than one message to a worker at a time
    ch.publish(ex, '', new Buffer.alloc(msg.length, msg), {persistent: true}); // Make messages durable
    console.log(" [x] Sent '%s'", msg);
  });
  setTimeout(function() { conn.close(); process.exit(0) }, 500);
});
