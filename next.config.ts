import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  sassOptions: {
    silenceDeprecations: ["global-builtin", "color-functions", "import"],
  },
};

export default nextConfig;
