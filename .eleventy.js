const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const sass = require("sass");
const postcss = require("postcss");
const postcssPresetEnv = require("postcss-preset-env");
const postcssCsso = require("postcss-csso");
const fs = require("fs");
const fsExtra = require("fs-extra");
const htmlmin = require("html-minifier");
const lazyImagesPlugin = require("eleventy-plugin-lazyimages");

module.exports = (eleventyConfig) => {
  // Copy images

  eleventyConfig.addPassthroughCopy("src/img");

  eleventyConfig.on("beforeBuild", async () => {
    const sassFiles = fs.readdirSync("src/scss");
    sassFiles.forEach((file) => {
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
  });
  // Plugins

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(lazyImagesPlugin);

  // Minify HTML

  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
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
