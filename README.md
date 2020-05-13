# IPFS Setup Action

A GitHub Action to install and initialize [go-ipfs](https://github.com/ipfs/go-ipfs) to run an instance of [InterPlanetary File System (IPFS)](https://ipfs.io/) in all supported runner platforms.
This action aims to provide an environment to test DApps that rely on IPFS.


## Inputs

This action automatically detects runner platform features like the operating system and the processor architecture.

### `ipfs_version`

A [released IPFS binary version](https://dist.ipfs.io/go-ipfs/versions) in [SemVer](https://semver.org/) format (Default: `0.5`).


## Example usage

A simple usage in `jobs.<job_id>.steps` with default latest IPFS version:

```yml
- uses: ibnesayeed/setup-ipfs@master
```

Setup a custom IPFS version (e.g., latest patch of IPFS `0.4.x`):

```yml
- uses: ibnesayeed/setup-ipfs@master
  with:
    ipfs_version: ^0.4
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
        with:
          ipfs_version: ${{ matrix.ipfs }}
```

See it in action in the [IPWB](https://github.com/oduwsdl/ipwb/blob/master/.github/workflows/test.yml) repo.
