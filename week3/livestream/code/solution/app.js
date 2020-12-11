/* Listening for Reaction Emojis */
// Your app *must* be in the channel of the message
// Event subscription: reaction_added
// Required scope(s): reactions:read
app.event('reaction_added', async ({ event, client }) => {

  const { reaction, user, item: { channel, ts } } = event;

  const langMap = {
    mx: ['es', 'Spanish'],
    es: ['es', 'Spanish'],
    ru: ['ru', 'Russian'],
    jp: ['ja', 'Japanese'],
  };

  // Note: some reactji flags don't contain 'flag-' (US, Spain, Japan, Russia)
  const validFlag = reaction.includes('flag-') || langMap[reaction];
  if (!validFlag) return;

  const [x, country] = langMap[reaction] ? [, reaction] : reaction.split('-');

  const result = await client.conversations.history({
    channel,
    latest: ts,
    inclusive: true,
    limit: 1
  });

  const { text: textToTranslate } = result.messages[0];
  const langIsSupported = langMap[country];

  if (langIsSupported) {
    const [countryCode, language] = langMap[country];
    const [translatedText, ...y] = await translateText(textToTranslate, countryCode);
  
    await client.chat.postMessage({
      channel,
      thread_ts: ts,
      text: `:${reaction}: *Here is the translation of this message in ${language}:*\n ${translatedText}`,
    });
  }
});

async function translateText(text, target) {
  try {
    return await translator.translate(text, target);
  } catch (e) {
    console.error(e);
  }
}

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running! ⚡️');
})();
