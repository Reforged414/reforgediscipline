export interface WebBlockerPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
