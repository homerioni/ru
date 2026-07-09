export function getJitsiEmbedUrl(roomName: string, displayName?: string): string {
  const room = encodeURIComponent(roomName);
  const hash = [
    'config.prejoinPageEnabled=false',
    'config.startAudioOnly=true',
    'config.startWithVideoMuted=true',
    'config.startWithAudioMuted=false',
    'config.disableDeepLinking=true',
    'config.disableSelfView=true',
    'config.disableSelfViewSettings=true',
    'config.disableVideoMenu=true',
    'interfaceConfig.MOBILE_APP_PROMO=false',
    'interfaceConfig.SHOW_JITSI_WATERMARK=false',
    'interfaceConfig.TOOLBAR_BUTTONS=["microphone","hangup"]',
    'interfaceConfig.VIDEO_LAYOUT_FIT=disable',
    'config.defaultLanguage=ru',
  ];

  if (displayName) {
    hash.push(`userInfo.displayName="${encodeURIComponent(displayName)}"`);
  }

  return `https://meet.jit.si/${room}#${hash.join('&')}`;
}
