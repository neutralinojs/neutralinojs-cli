const BIN_FILE_PREFIX = "neutralino-";

module.exports = {
  remote: {
    binaries: {
      version: "2.6.0",
      url: "https://github.com/neutralinojs/neutralinojs/releases/download/v{version}/neutralinojs-v{version}.zip"
    },
    client: {
      version: "1.3.0",
      url: "https://github.com/neutralinojs/neutralino.js/releases/download/v{version}/neutralino.js"
    },
    templateUrl: "https://github.com/neutralinojs/{repoId}/archive/main.zip"
  },
  templates: {
    minimal: {
      repoId: "neutralinojs-minimal"
    }
  },
  files: {
    configFile: "neutralino.config.json",
    logFile: "neutralinojs.log",
    clientLibrary: "neutralino.js",
    resourceFile: "res.neu",
    binaries: {
      linux: {
        x64: `${BIN_FILE_PREFIX}linux_x64`,
        ia32: `${BIN_FILE_PREFIX}linux_ia32`
      },
      darwin: {
        x64: `${BIN_FILE_PREFIX}mac_x64`   
      },
      win32: {
        x64: `${BIN_FILE_PREFIX}win_x64.exe`
      }
    },
    dependencies: {
      windows_webview2loader_x64: "WebView2Loader.dll"
    }
  },
  settings: {
    devServerPort: 5050
  }
};
