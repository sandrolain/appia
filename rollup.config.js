import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";

export default [
  {
    input: {
      index: "src/index.ts"
    },
    output: [
      {
        dir: "./dist",
        format: "esm",
        name: "appia",
        sourcemap: true
      }
    ],
    plugins: [
      del({
        targets: ["./dist/*"]
      }),
      typescript({
        typescript: require("typescript")
      }),
      resolve(),
      terser({
        output: {
          comments: false
        }
      })
    ]
  }
];
