import amqp from 'amqplib';

async function send() {
  const conn = await amqp.connect('amqp://guest:guest@localhost');
  const ch = await conn.createChannel();
  const q = 'testQueue';

  await ch.assertQueue(q, { durable: false });
  ch.sendToQueue(q, Buffer.from('Hello World!'));
  console.log(" [x] Sent 'Hello World!' to queue: " + q);
  
  setTimeout(async () => {
    await ch.close();
    await conn.close();
    console.log("RabbitMQ connection closed.");
  }, 500);
}

send().catch(error => console.error(`Failed to send message: ${error}`));
