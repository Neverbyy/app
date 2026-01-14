import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

// Общие опции для Linux пакетов (без categories, так как они могут отличаться)
const baseLinuxPackageOptions = {
  name: "sofi-agent",
  productName: "Sofi Agent",
  description: "Sofi agent desktop application",
  version: "1.0.8",
  homepage: "https://sofi-assistant.com",
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./assets/icons/icon", // Путь к иконке без расширения (Electron автоматически найдет .ico, .icns, .png)
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "sofi-agent",
      authors: "Sofi Team",
    }),
    new MakerZIP({}, ["darwin"]),
    // Linux пакеты можно собрать только на Linux системе
    ...(process.platform === "linux"
      ? [
          new MakerRpm({
            options: {
              ...baseLinuxPackageOptions,
              categories: ["Utility"],
            },
          }),
          new MakerDeb({
            options: {
              ...baseLinuxPackageOptions,
              categories: ["Utility"],
              maintainer: "Sofi Team",
            },
          }),
        ]
      : []),
    // ZIP архив для Linux (можно собрать на любой платформе)
    new MakerZIP({}, ["linux"]),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/backend/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
