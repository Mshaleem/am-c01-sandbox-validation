import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: [
    '@trimble-oss/moduswebcomponents',
    '@trimble-oss/moduswebcomponents-react',
  ],
  agentRules: false,
};

export default nextConfig;
