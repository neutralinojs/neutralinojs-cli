import fse from 'fs-extra'
import * as png2icons from 'png2icons'
import path from 'path'
import * as config from './config'

const EN_US = 1033

const pickNotNullish = <T>(...values: T[]): T => {
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] !== undefined && values[i] !== null) {
      return values[i]
    }
  }
  return values[values.length - 1]
}

const getWindowsMetadata = (configObj: any): Record<string, string> => {
  const copyright = pickNotNullish(
    configObj.copyright,
    `Copyright © ${new Date().getFullYear()} ${pickNotNullish(configObj.author, 'All rights reserved.')}`,
  )

  const versionStrings: Record<string, string | undefined> = {
    CompanyName: configObj.author,
    FileDescription: pickNotNullish(
      configObj.description,
      'A Neutralinojs application',
    ),
    ProductVersion: configObj.version,
    LegalCopyright: copyright,
    InternalName: configObj.cli.binaryName,
    OriginalFilename: configObj.cli.binaryName,
    ProductName: pickNotNullish(
      configObj.applicationName,
      configObj.cli.binaryName,
    ),
    SpecialBuild: configObj.cli.binaryName,
  }

  Object.keys(versionStrings).forEach(option => {
    if (versionStrings[option] === undefined) {
      delete versionStrings[option]
    }
  })

  return versionStrings as Record<string, string>
}

const convertPngToIco = async (src: string): Promise<Buffer> => {
  const icon = await fse.readFile(src)
  return png2icons.createICO(icon, png2icons.HERMITE, 0, true, true) as Buffer
}

export const patchWindowsExecutable = async (src: string): Promise<void> => {
  const resedit = await import('resedit')
  const peLibrary = await import('pe-library')

  const configObj = config.get()
  const exeBuffer = await fse.readFile(src)

  const exe = peLibrary.NtExecutable.from(exeBuffer)
  const res = peLibrary.NtExecutableResource.from(exe)

  let windowIcon: string | null = null
  if (configObj.modes?.window?.icon) {
    windowIcon = configObj.modes.window.icon

    if (windowIcon.split('.').pop()?.toLowerCase() !== 'png') {
      windowIcon = null
    } else {
      if (windowIcon[0] === '/') {
        windowIcon = windowIcon.slice(1)
      }
      windowIcon = path.join(process.cwd(), windowIcon)
    }
  }

  const iconPath = pickNotNullish(
    (configObj as any).applicationIcon,
    windowIcon,
    path.join(__dirname, '../../images/defaultIcon.png'),
  )

  const icoBuffer = await convertPngToIco(iconPath)
  const iconFile = resedit.Data.IconFile.from(icoBuffer)

  resedit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries,
    0,
    EN_US,
    iconFile.icons.map(i => i.data),
  )

  const vi = resedit.Resource.VersionInfo.createEmpty()
  const versionParts = pickNotNullish(configObj.version, '1.0.0').split('.')

  vi.setFileVersion(
    parseInt(versionParts[0] || '1'),
    parseInt(versionParts[1] || '0'),
    parseInt(versionParts[2] || '0'),
    0,
    EN_US,
  )

  vi.setStringValues(
    { lang: EN_US, codepage: 1200 },
    getWindowsMetadata(configObj),
  )

  vi.outputToResourceEntries(res.entries)
  res.outputResource(exe)

  const outBuffer = Buffer.from(exe.generate())
  await fse.writeFile(src, outBuffer)
}
