import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.alexjyong.sproutplay',
  appName: 'SproutPlay',
  webDir: 'www',
  server: {
    // Allow local file access for Capacitor
    androidScheme: 'https'
  },
  plugins: {
    // Plugin configurations will be added as needed
  }
};

export default config;
