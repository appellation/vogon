const { Cluster } = require('@spectacles/gateway');
const { Amqp } = require('@spectacles/brokers');

const cluster = new Cluster(process.env.DISCORD_TOKEN);
const workers = new Amqp('workers');

workers.connect(process.env.AMQP_HOST || 'rabbit').catch(console.error);
cluster.spawn().catch(console.error);

workers.on('error', console.error);
cluster.on('error', console.error);
cluster.on('READY', (_, shard) => console.log(`shard ${shard.id} ready`));

for (const event of [
	'MESSAGE_CREATE',
]) cluster.on(event, (packet) => workers.publish(event, packet));
