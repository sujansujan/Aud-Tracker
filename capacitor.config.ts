import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.audiotracker.app',
  appName: 'Audible Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
