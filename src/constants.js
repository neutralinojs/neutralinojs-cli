module.exports = {
  remote: {
    binaries: {
      url: "https://github.com/neutralinojs/neutralinojs/releases/download/v{version}/neutralinojs-v{version}.zip"
    },
    client: {
      url: "https://github.com/neutralinojs/neutralino.js/releases/download/v{version}/neutralino.js"
    },
    templateUrl: "https://github.com/{template}/archive/main.zip"
  },
  files: {
    configFile: "neutralino.config.json",
    logFile: "neutralinojs.log",
    clientLibrary: "neutralino.js",
    resourceFile: "resources.neu",
    authFile: ".tmp/auth_info.json",
    binaries: {
      linux: {
        x64: "neutralino-linux_x64",
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
