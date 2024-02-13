/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

const webpack = require('webpack');

module.exports = {
  // 다른 설정들...
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:5001/:path*'
  //     }
  //   ]
  // },

  // webpack 설정 추가
  webpack: (config, { isServer }) => {
    // 서버 사이드 렌더링 중에는 Quill을 로드하지 않도록 설정
    if (isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^quill$/,
        }),
      );
    }
    return config;
  },
};
