const fse = require('fs-extra');
const png2icons = require('png2icons');
const path = require('path');

const config = require('./config');
// 1033 means "English (United States)" locale in Windows
const EN_US = 1033;

// works like `a ?? b ?? c ?? ...`
const pickNotNullish = (...values) => {
    for (let i = 0; i < values.length - 1; i++) {
        if (values[i] !== undefined && values[i] !== null) {
            return values[i];
        }
    }
    return values[values.length - 1];
}

const getWindowsMetadata = (config) => {
    const copyright = pickNotNullish(
        config.copyright,
        `Copyright © ${new Date().getFullYear()} ${pickNotNullish(config.author, 'All rights reserved.')}`
    );
    const versionStrings = {
        CompanyName: config.author,
        FileDescription: pickNotNullish(config.description, 'A Neutralinojs application'),
        ProductVersion: config.version,
        LegalCopyright: copyright,
        InternalName: config.cli.binaryName,
        OriginalFilename: config.cli.binaryName,
        ProductName: pickNotNullish(config.applicationName, config.cli.binaryName),
        SpecialBuild: config.cli.binaryName,
    };
    // Strip away any undefined values from the versionStrings object
    // in case some configuration options are missing.
    Object.keys(versionStrings).forEach((option) => {
        if (versionStrings[option] === undefined) {
            delete versionStrings[option];
        }
    });
    return versionStrings;
};

/**
 * Reads the specified png file and returns a buffer of a converted ICO file.
 */
const convertPngToIco = async (src) => {
    const icon = await fse.readFile(src);
    return png2icons.createICO(icon, png2icons.HERMITE, 0, true, true);
}

/**
 * Edits the Windows executable with an icon
 * and changes its metadata to include the app's name and version.
 *
 * @param {string} src The path to the .exe file
 */
const patchWindowsExecutable = async (src) => {
    const resedit = await import('resedit');
    // pe-library is a direct dependency of resedit
    const peLibrary = await import('pe-library');
    const configObj = config.get();
    // Create an executable object representation of the .exe file and get its resource object
    const exe = peLibrary.NtExecutable.from(await fse.readFile(src));
    const res = peLibrary.NtExecutableResource.from(exe);

    // If an icon was not set for the project, try to get the icon from the window's config
    let windowIcon = null;
    if (configObj.modes && configObj.modes.window && configObj.modes.window.icon) {
        windowIcon = configObj.modes.window.icon;
        // Do not use non-PNG window icons.
        if (windowIcon.split('.').pop().toLowerCase() !== 'png') {
            windowIcon = null;
        } else {
            // Remove the leading slash if it exists, we need a path relative to CWD.
            if (windowIcon[0] === '/') {
                windowIcon = windowIcon.slice(1);
            }
            // Get the path from the resources directory relative to CWD.
            windowIcon = path.join(process.cwd(), windowIcon);
        }
    }

    const iconPath = pickNotNullish(
        configObj.applicationIcon,
        windowIcon,
        `${__dirname}/../../images/defaultIcon.png` // Default to a neutralinojs icon
    );
    const icoBuffer = await convertPngToIco(iconPath);
    // Create an icon file that contains the icon
    const iconFile = resedit.Data.IconFile.from(icoBuffer);
    // Put the group into the resource
    resedit.Resource.IconGroupEntry.replaceIconsForResource(
        res.entries,
        // 0 is the default icon group
        0,
        EN_US,
        iconFile.icons.map(i => i.data)
    );

    // Fill in version info
    const vi = resedit.Resource.VersionInfo.createEmpty();
    const [major, minor, patch] = pickNotNullish(configObj.version, '1.0.0').split(".");
    vi.setFileVersion(
        pickNotNullish(major, 1), // Version number
        pickNotNullish(minor, 0),
        pickNotNullish(patch, 0),
        0, // Revision number, isn't used in most JS applications so use a 0.
        EN_US
    );
    vi.setStringValues({
        lang: EN_US,
        codepage: 1200
    }, getWindowsMetadata(configObj));
    vi.outputToResourceEntries(res.entries);
    // Write the modified resource to the executable object
    res.outputResource(exe);
    // Output the modified executable to the original file path
    const outBuffer = Buffer.from(exe.generate());
    await fse.writeFile(src, outBuffer);
}

module.exports = {
    patchWindowsExecutable
};