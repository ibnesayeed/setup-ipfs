# IPFS Setup Action

A GitHub Action to install and initialize [go-ipfs](https://github.com/ipfs/go-ipfs) to run an instance of [InterPlanetary File System (IPFS)](https://ipfs.io/) in all supported runner platforms.
This action aims to provide an environment to test DApps that rely on IPFS.


## Inputs

This action automatically detects runner platform features like the operating system and the processor architecture.

### `ipfs_version`

IPFS version, automatically resolved to the best matching [released binary](https://dist.ipfs.io/go-ipfs/versions) as per the [SemVer format](https://semver.org/) (default: `0.5`).

### `run_daemon`

Whether to start IPFS service daemon after installation and initialization (default: `false`).


## Outputs

The setup process sets some output variables to be utilized in any succeeding steps.

### `resolved_ipfs_version`

Latest matching SemVer IPFS version installed.

### `ipfs_download_url`

Utilized IPFS distribution download URL.

### `peer_id`

Identity of the peer as reported on initialization.

### `welcome_ref`

Hash of the Welcome object containing `readme`, `help`, and other files.


## Example usage

A simple usage in `jobs.<job_id>.steps` with default latest IPFS version:

```yml
- uses: ibnesayeed/setup-ipfs@master
```

Setting up a custom IPFS version (e.g., latest patch of IPFS `0.4.x`):

```yml
- uses: ibnesayeed/setup-ipfs@master
  with:
    ipfs_version: ^0.4
```

Automatically booting the IPFS API service after installation and initialization:

```yml
- uses: ibnesayeed/setup-ipfs@master
  with:
    run_daemon: true
```

A comprehensive example with matrix setup to test against various virsions of IPFS on various platforms:

```yml
jobs:
  test-in-matrix:
    strategy:
      matrix:
        os:
          - ubuntu-latest
          - macos-latest
          - windows-latest
        ipfs:
          - 0.4
          - 0.5
    runs-on: ${{ matrix.os }}
    name: Test on ${{ matrix.os }} with IPFS ${{ matrix.ipfs }}
    steps:
      - name: Set up IPFS ${{ matrix.ipfs }}
        uses: ibnesayeed/setup-ipfs@master
        id: ipfs_setup
        with:
          ipfs_version: ${{ matrix.ipfs }}
          run_daemon: true
      - name: Test IPFS ${{ steps.ipfs_setup.outputs.resolved_ipfs_version }} CLI and API
        shell: bash
        run: |
          set -o pipefail
          ipfs cat ${{ steps.ipfs_setup.outputs.welcome_ref }}/readme
          curl -sX POST http://localhost:5001/api/v0/version | jq -e '(.Version=="${{ steps.ipfs_setup.outputs.resolved_ipfs_version }}")'
```

[See this example in action](https://github.com/ibnesayeed/setup-ipfs/blob/master/.github/workflows/test.yml).
