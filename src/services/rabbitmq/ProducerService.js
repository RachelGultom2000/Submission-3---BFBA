const amqp = require('amqplib')

const ProducerService = {
    sendMessage: async (queue, message) => {
        const connectionService = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channelService = await connectionService.createChannel();
        await channelService.assertQueue(queue, {
            durable: true,
        });

        await channelService.sendToQueue(queue, Buffer.from(message));

        setTimeout(() => {
            connectionService.close();
        },1000);
    },
};

module.exports = ProducerService;