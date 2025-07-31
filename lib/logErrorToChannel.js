async function logErrorToChannel(client, message) {
  const channelId = process.env.LOG_CHANNEL_ID;
  if (!client || !channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.send) return;

    const msg = message.length > 1900 ? message.slice(0, 1900) + '…' : message;
    await channel.send({ content: `📛 **Bot Error**\n\`\`\`js\n${msg}\n\`\`\`` });
  } catch (err) {
    console.warn('Failed to send log to channel:', err.message);
  }
}

module.exports = logErrorToChannel;