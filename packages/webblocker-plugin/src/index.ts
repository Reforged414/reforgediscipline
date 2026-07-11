import { registerPlugin } from '@capacitor/core';

import type { WebBlockerPluginPlugin } from './definitions';

const WebBlockerPlugin = registerPlugin<WebBlockerPluginPlugin>('WebBlockerPlugin', {
  web: () => import('./web').then((m) => new m.WebBlockerPluginWeb()),
});

export * from './definitions';
export { WebBlockerPlugin };
