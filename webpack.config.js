const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
    // Produktionsmodus oder Entwicklungsmodus?
    const isProd = env.production === "true";
    const outputSubDir = isProd ? "" : "dev"; // In "dev" oder direkt in "dist"

    console.log(`Building for: ${isProd ? "production" : "development"}`);
    console.log(`Output directory: dist/${outputSubDir}`);

    return {
        entry: path.resolve(__dirname, "src/app.ts"),
        output: {
            path: path.resolve(__dirname, `dist/${outputSubDir}`), // Zielverzeichnis
            filename: "js/app.js",
            clean: true,
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, "dist"),
            },
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
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(glb|gltf)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: "assets",
                            },
                        },
                    ],
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