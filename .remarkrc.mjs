import remarkFrontmatter from "remark-frontmatter";
// Remark configuration for Markdown autoformatting
// - Wraps to 120 columns
// - Uses GitHub Flavored Markdown
import remarkGfm from "remark-gfm";

/** @type {import('unified').PartialProcessorOptions} */
const config = {
  settings: {
    // Formatting options
    bullet: "-",
    emphasis: "_",
    strong: "*",
    rule: "-",
    listItemIndent: "one",
    fences: true,
    incrementListMarker: false,
    setext: false,
    quote: '"',
    // Hard-wrap prose at 120 columns (MD013 target)
    wrap: 120,
  },
  plugins: [remarkFrontmatter, remarkGfm],
};

export default config;
