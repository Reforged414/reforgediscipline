import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'your.package.id', // Keep whatever your appId is here
  appName: 'reforgediscipline',
  webDir: 'dist',
  plugins: {
    GoogleSignIn: {
      clientId: '901513190581-kebnm9ij83851i249b10mk286gi2r0ov.apps.googleusercontent.com',
    },
  },
};

export default config;
