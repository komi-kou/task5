/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  // Renderでは standalone は不要
  // output: 'standalone',
  
  // TypeScriptとESLintのビルドエラーを無視
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ビルド時の静的生成を無効化（APIルートの実行を防ぐ）
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Render用の設定
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;