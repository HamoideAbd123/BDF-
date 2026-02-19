/** @type {import('next').NextConfig} */
const nextConfig = {
  // تعطيل الخرائط لتقليل استهلاك الرام
  productionBrowserSourceMaps: false,
  
  // تجاهل الأخطاء أثناء التطوير لتسريع العملية
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    // إعدادات لتقليل الضغط على Core i3
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    workerThreads: false,
  },

  // تحسين الأداء
  swcMinify: true,
};

export default nextConfig;