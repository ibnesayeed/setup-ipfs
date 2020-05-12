const path = require('path')
const core = require('@actions/core')
const tc = require('@actions/tool-cache')
const exec = require('@actions/exec')

const ISWIN = process.platform === 'win32'

function ipfsDistUrl(version) {
    const os = ISWIN ? 'windows' : process.platform
    const arch = process.arch === 'x32' ? '386' : process.arch === 'x64' ? 'amd64' : process.arch
    const pkg = ISWIN ? 'zip' : 'tar.gz'
    return `https://dist.ipfs.io/go-ipfs/${version}/go-ipfs_${version}_${os}-${arch}.${pkg}`
}

async function run() {
    try {
        const ipfsVer = core.getInput('ipfs_version')
        const ipfsPkgPath = await tc.downloadTool(ipfsDistUrl(ipfsVer))
        const ipfsExtractedFolder = ISWIN ? await tc.extractZip(ipfsPkgPath) : await tc.extractTar(ipfsPkgPath)
        const ipfsPath = await tc.cacheDir(ipfsExtractedFolder, 'ipfs', ipfsVer);
        core.addPath(path.join(ipfsPath, 'go-ipfs'))

        try {
            await exec.exec('ipfs init')
        } catch (error) {
            core.info(error.message)
            core.info('IPFS initialization failed, perhaps already initialized')
        }

        await exec.exec('ipfs cat /ipfs/QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc/readme')
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
