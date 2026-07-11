import { WebPlugin } from '@capacitor/core';

import type { WebBlockerPluginPlugin } from './definitions';

export class WebBlockerPluginWeb extends WebPlugin implements WebBlockerPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
