// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const path = require("path");
const fs = require("fs");

const packages = require("../package-list.json").packages.map((it) => ({
  ...it,
  packageJson: require(`../packages/${it.name}/package.json`),
}));

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "rster",
  tagline: "Design the backend of your dreams",
  favicon: "img/favicon.ico",
  staticDirectories: ["public", "static", "typedoc"],

  // Set the production url of your site here
  url: "https://nsc-de.github.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/rster/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "nsc-de", // Usually your GitHub org/user name.
  projectName: "rster", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/nsc-de/rster/tree/master/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/nsc-de/rster/tree/master/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "rster",
        logo: {
          alt: "rster logo",
          src: "img/logo-small.svg",
        },
        items: [
          {
            to: "/docs/intro",
            position: "left",
            label: "Tutorial",
          },
          {
            to: "/docs/api-reference",
            label: "API Reference",
            position: "left",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/nsc-de/rster",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/rster",
              },
              // {
              //   label: "Discord",
              //   href: "https://discordapp.com/invite/docusaurus",
              // },
              // {
              //   label: "Twitter",
              //   href: "https://twitter.com/docusaurus",
              // },
            ],
          },
          {
            title: "More",
            items: [
              // {
              //   label: "Blog",
              //   to: "/blog",
              // },
              {
                label: "GitHub",
                href: "https://github.com/nsc-de/rster",
              },
              // {
              //   label: "TypeDoc",
              //   href: "https://nsc-de.github.io/rster/typedoc/",
              // },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} rster. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    ...packages.map((it, i) => [
      "docusaurus-plugin-typedoc",

      // Plugin / TypeDoc options
      {
        entryPoints: [path.resolve(`../packages/${it.name}/src/index.ts`)],
        tsconfig: path.resolve(`../packages/${it.name}/tsconfig.json`),
        id: `@typedoc/${it.name}`,
        plugin: ["typedoc-plugin-mdn-links"],
        sidebar: {
          autoConfiguration: true,
          position: 0,
        },
        cleanOutputDir: true,
        out: `api-reference/${it.name}`,
        sidebar: {
          categoryLabel: it.packageJson.name,
          position: i,
        },
      },
    ]),
  ],
};

module.exports = config;
