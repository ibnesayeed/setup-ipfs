const cp = require('child_process')
const path = require('path')


test('main script runs', () => {
    process.env['INPUT_IPFS_VERSION'] = '0.6'
    process.env['INPUT_RUN_DAEMON'] = true
    process.env['RUNNER_TEMP'] = path.join(__dirname, 'TEMP')
    process.env['RUNNER_TOOL_CACHE'] = path.join(__dirname, 'CACHE')
    const ip = path.join(__dirname, 'index.js')
    console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString())
})
