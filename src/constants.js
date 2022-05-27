module.exports = {
  remote: {
    binaries: {
      url: "https://github.com/neutralinojs/neutralinojs/releases/download/{tag}/neutralinojs-{tag}.zip"
    },
    client: {
      url: "https://github.com/neutralinojs/neutralino.js/releases/download/{tag}/neutralino.js"
    },
    templateUrl: "https://github.com/{template}/archive/main.zip"
  },
  files: {
    configFile: "neutralino.config.json",
    clientLibrary: "neutralino.js",
    resourceFile: "resources.neu",
    authFile: ".tmp/auth_info.json",
    binaries: {
      linux: {
        x64: "neutralino-linux_x64",
        armhf: "neutralino-linux_armhf",
        arm64: "neutralino-linux_arm64"
      },
      darwin: {
        x64: "neutralino-mac_x64"
      },
      win32: {
        x64: "neutralino-win_x64.exe"
      }
    },
    dependencies: ["WebView2Loader.dll"]
  },
  misc: {
    hotReloadPatchRegex: /(<script.*src=")(.*neutralino.js)(".*><\/script>)/g
  }
};
