const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var ex = 'logs';

    channel.assertExchange(ex, 'fanout', {durable: false});
    channel.assertQueue('', {exclusive: false, durable: false}, function(error2, q) { // Made the queue durable
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      channel.bindQueue(q.queue, ex, '');

      channel.consume(q.queue, function(msg) {
        if(msg.content) {
          console.log(" [x] Done processing %s. Dashboard: http://localhost:15672/#/queues/%2F/%s", msg.content.toString(), q.queue);
          channel.ack(msg);
        }
      }, {noAck: false});
    });
  });
});
