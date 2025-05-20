import type { NextConfig } from "next"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		config.plugins = [...(config.plugins || []), new MiniCssExtractPlugin()]
		return config
	},
}

export default nextConfig
