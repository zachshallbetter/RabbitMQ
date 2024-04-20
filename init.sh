#!/bin/sh
# Wait for RabbitMQ server to start
sleep 10
# Enable plugins
rabbitmq-plugins enable --offline rabbitmq_shovel rabbitmq_shovel_management