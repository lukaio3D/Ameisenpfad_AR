const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  const isProd = env.production === "true";
  const outputSubDir = isProd ? "" : "dev";

  console.log(`Building for: ${isProd ? "production" : "development"}`);
  console.log(`Output directory: dist/${outputSubDir}`);

  return {
    entry: path.resolve(__dirname, "src/app.ts"),
    output: {
      path: path.resolve(__dirname, `dist/${outputSubDir}`),
      filename: "js/app.js",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "public"),
        },
        {
          directory: path.join(__dirname, "src/assets"),
          publicPath: "/assets",
        },
      ],
      compress: true,
      port: 5500,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          include: path.resolve(__dirname, "src"),
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(glb|gltf)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
      }),
    ],
    mode: isProd ? "production" : "development",
  };
};
