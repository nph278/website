const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const sass = require("dart-sass");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCsso = require("postcss-csso");
const fs = require("fs");
const fsExtra = require("fs-extra");
const htmlmin = require("html-minifier");

module.exports = (eleventyConfig) => {
  // Copy SCSS to build, before compiling.
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("scss");
  eleventyConfig.addPassthroughCopy("sass");

  eleventyConfig.on("beforeBuild", () => {
    const dirs = fs.readdirSync("src/scss");
    dirs.forEach((file) => {
      // Compile Sass
      let result = sass.renderSync({
        file: `src/scss/${file}`,
        sourceMap: false,
        outputStyle: "compressed",
      });
      console.log(`Compiled ${file}`);

      // Optimize and write file with PostCSS
      let css = result.css.toString();
      postcss([postcssPresetEnv, postcssCsso])
        .process(css, {
          from: file.slice(0, -4) + "css",
          to: `css/${file.slice(0, -4)}css`,
        })
        .then((result) => {
          fsExtra.outputFile(
            `build/css/${file.slice(0, -4)}css`,
            result.css,
            (err) => {
              if (err) throw err;
              console.log(`Optimized ${file}`);
            }
          );
        });
    });
    fsExtra.remove("build/scss");
  });

  // Syntax Highlighting

  eleventyConfig.addPlugin(syntaxHighlight);

  // Minify HTML

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  return {
    dir: {
      input: "src",
      output: "build",
      includes: "../layouts",
      data: "../data",
    },
    markdownTemplateEngine: "njk",
  };
};
