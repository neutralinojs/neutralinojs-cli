module.exports = {
  remote: {
    binaries: {
      version: "3.0.0",
      url: "https://github.com/neutralinojs/neutralinojs/releases/download/v{version}/neutralinojs-v{version}.zip"
    },
    client: {
      version: "2.0.0",
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
        x64: 'neutralino-linux_x64',
        ia32: 'neutralino-linux_ia32',
        arm: 'neutralino-linux_armhf'
      },
      darwin: {
        x64: 'neutralino-mac_x64'   
      },
      win32: {
        x64: 'neutralino-win_x64.exe'
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
