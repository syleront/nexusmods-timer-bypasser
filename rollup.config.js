import resolve from "@rollup/plugin-node-resolve";
import meta from "./rollup-plugins/userscript-meta";

export default {
  input: "src/index.js",
  plugins: [
    resolve(),
    meta({
      path: "./src/index.meta.js"
    })
  ],
  output: [
    {
      strict: false,
      file: "./dist/index.user.js",
      format: "iife",
      exports: "named",
      sourcemap: false
    }
  ]
};