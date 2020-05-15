const path = require('path')
const fs = require('fs')
const semver = require('semver')
const core = require('@actions/core')
const tc = require('@actions/tool-cache')
const exec = require('@actions/exec')
const cp = require('child_process')

const MAXATTEMPTS = 30
const IPFSAPI = 'http://localhost:5001/api/v0/version'
const IPFSVERS = 'https://dist.ipfs.io/go-ipfs/versions'
const ISWIN = process.platform === 'win32'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function ipfsDistVersion(version) {
    const ipfsVersPath = await tc.downloadTool(IPFSVERS)
    return fs.readFileSync(ipfsVersPath, 'utf8').trim().split('\n').filter(v => semver.satisfies(v, version)).sort(semver.rcompare)[0] || version
}

function ipfsDistUrl(version) {
    const os = ISWIN ? 'windows' : process.platform
    const arch = process.arch === 'x32' ? '386' : process.arch === 'x64' ? 'amd64' : process.arch
    const pkg = ISWIN ? 'zip' : 'tar.gz'
    return `https://dist.ipfs.io/go-ipfs/${version}/go-ipfs_${version}_${os}-${arch}.${pkg}`
}

async function run() {
    try {
        const ipfsVer = core.getInput('ipfs_version')
        const runDaemon = core.getInput('run_daemon')
        const ipfsDistVer = await ipfsDistVersion(ipfsVer)
        const ipfsDownloadUrl = ipfsDistUrl(ipfsDistVer)
        core.setOutput('resolved_ipfs_version', ipfsDistVer.replace(/^v/, ''))
        core.setOutput('ipfs_download_url', ipfsDownloadUrl)
        const ipfsPkgPath = await tc.downloadTool(ipfsDownloadUrl)
        const ipfsExtractedFolder = ISWIN ? await tc.extractZip(ipfsPkgPath) : await tc.extractTar(ipfsPkgPath)
        const ipfsPath = await tc.cacheDir(ipfsExtractedFolder, 'ipfs', ipfsDistVer);
        core.addPath(path.join(ipfsPath, 'go-ipfs'))

        let welcomeCid
        const opts = {
            ignoreReturnCode: true,
            listeners: {
                stdout: data => {
                    try {
                        welcomeCid = data.toString().match(/ipfs cat \/ipfs\/(?<cid>\w+)\/readme/).groups.cid
                    } catch (error) {
                        // Do nothing
                    }
                }
            }
        }
        await exec.exec('ipfs', ['init'], opts)

        if (welcomeCid) {
            await exec.exec('ipfs', ['cat', `${welcomeCid}/readme`])
        }

        if (runDaemon) {
            const daemon = cp.spawn('ipfs', ['daemon'], {detached: true, stdio: 'ignore'})
            daemon.unref()
            let attemptsLeft = MAXATTEMPTS
            while (--attemptsLeft) {
                try {
                    await exec.exec('curl', ['-s', '-X', 'POST', IPFSAPI])
                    break
                } catch (error) {
                    await sleep(1000)
                }
            }
            if (!attemptsLeft) {
                throw new Error('IPFS API service unreachable')
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
