import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  output: "standalone"
};

export default nextConfig;
