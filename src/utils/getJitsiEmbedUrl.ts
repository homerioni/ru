export function getJitsiEmbedUrl(roomName: string, displayName?: string): string {
  const room = encodeURIComponent(roomName);
  const hash = [
    'config.prejoinPageEnabled=false',
    'config.startWithVideoMuted=true',
    'config.startWithAudioMuted=false',
    'config.disableDeepLinking=true',
    'interfaceConfig.MOBILE_APP_PROMO=false',
    'interfaceConfig.SHOW_JITSI_WATERMARK=false',
    'interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","tileview","hangup"]',
    'config.defaultLanguage=ru',
  ];

  if (displayName) {
    hash.push(`userInfo.displayName="${encodeURIComponent(displayName)}"`);
  }

  return `https://meet.jit.si/${room}#${hash.join('&')}`;
}
