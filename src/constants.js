module.exports = {
  remote: {
    binariesUrl:"https://github.com/neutralinojs/neutralinojs/releases/download/{tag}/neutralinojs-{tag}.zip",
    clientUrlPrefix: "https://github.com/neutralinojs/neutralino.js/releases/download/{tag}/neutralino.",
    templateUrl: "https://github.com/{template}/archive/main.zip",
    releasesApiUrl: "https://api.github.com/repos/neutralinojs/{repo}/releases/latest",
    templateCheckUrl: "https://api.github.com/repos/{template}/contents/neutralino.config.json"
  },
  files: {
    configFile: "neutralino.config.json",
    clientLibraryPrefix: "neutralino.",
    resourceFile: "resources.neu",
    authFile: ".tmp/auth_info.json",
    binaries: {
      linux: {
        x64: "neutralino-linux_x64",
        armhf: "neutralino-linux_armhf",
        arm64: "neutralino-linux_arm64"
      },
      darwin: {
        x64: "neutralino-mac_x64",
        arm64: "neutralino-mac_arm64",
        universal: "neutralino-mac_universal"
      },
      win32: {
        x64: "neutralino-win_x64.exe"
      }
    },
    dependencies: []
  },
  misc: {
    hotReloadLibPatchRegex: /(<script.*src=")(.*neutralino.js)(".*><\/script>)/g,
    hotReloadGlobPatchRegex: /(<script.*src=")(.*__neutralino_globals.js)(".*><\/script>)/g
  }
};
