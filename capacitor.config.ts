import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reforged.discipline',
  appName: 'Reforged Discipline',
  webDir: 'dist',
  plugins: {
    GoogleSignIn: {
      providers: ['google.com'],
      iosClientId: '901513190581-kebnm9ij83851i249b10mk286gi2r0ov.apps.googleusercontent.com'
    }
  }
};

export default config;