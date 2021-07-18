module.exports = {
  remote: {
    binaries: {
      version: "2.5.0",
      url: "https://github.com/neutralinojs/neutralinojs/releases/download/v{version}/neutralinojs-v{version}.zip"
    },
    client: {
      version: "1.1.0",
      url: "https://github.com/neutralinojs/neutralino.js/releases/download/v{version}/neutralino.js"
    },
    clientLib: {
      version: null,
      url: null
    }
  },
  templates: {
    minimal: {
      repoId: "neutralinojs-minimal"
    }
  },
  files: {
    configFile: "neutralino.config.json",
    logFile: "neutralinojs.log"
  }
};
