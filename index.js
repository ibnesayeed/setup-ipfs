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

        let welcomeCid
        const opts = {
            ignoreReturnCode: true,
            listeners: {
                stdline: data => {
                    console.log(`Line: ${data}`)
                    try {
                        welcomeCid = data.match(/ipfs cat \/ipfs\/(?<cid>\w+)\/readme/).groups.cid
                        console.log(`Found Welcome CID: ${welcomeCid}`)
                    } catch (error) {
                        // Do nothing
                    }
                }
            }
        }
        await exec.exec('ipfs', ['init'], opts)

        console.log(`Value of CID: ${welcomeCid}`)

        welcomeCid = 'QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc'

        if (welcomeCid) {
            await exec.exec('ipfs', ['cat', `/ipfs/${welcomeCid}/readme`])
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
