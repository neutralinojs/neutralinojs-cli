const fse = require('fs-extra');
const png2icons = require('png2icons');

const config = require('./config');
// 1033 means "English (United States)" locale in Windows
const EN_US = 1033;

const getWindowsMetadata = (config) => {
    const versionStrings = {
        CompanyName: config.author,
        FileDescription: config.description ?? 'A Neutralinojs application',
        ProductVersion: config.version,
        LegalCopyright: config.copyright ??
            `Copyright © ${new Date().getFullYear()} ${config.author ?? 'All rights reserved.'}`,
        InternalName: config.cli.binaryName,
        OriginalFilename: config.cli.binaryName,
        ProductName: config.applicationName ?? config.cli.binaryName,
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

    const iconPath = configObj.applicationIcon ??
        configObj?.modes?.window?.icon ?? // Get the icon from the window's config
        `${__dirname}/../../images/defaultIcon.png`; // Default to a neutralinojs icon
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
    const [major, minor, patch] = (configObj.version ?? '1.0.0').split(".");
    vi.setFileVersion(major ?? 1, minor ?? 0, patch ?? 0, 0, EN_US);
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