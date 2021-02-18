import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/js/index.js",
  output: {
    file: "build/js/bundle.js",
    format: "iife",
  },
  plugins: [nodeResolve(), commonjs(), babel(), terser()],
};
