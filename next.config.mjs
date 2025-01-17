/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['login-express-backend.onrender.com'], // Add your external image domain(s) here
    },
  };
  
  export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'login-express-backend.onrender.com',
//         pathname: '/**', // Match all paths
//       },
//     ],
//   },
// };

// export default nextConfig;