# IPFS Setup Action

A GitHub Action to install and initialize [go-ipfs](https://github.com/ipfs/go-ipfs) to run an instance of [InterPlanetary File System (IPFS)](https://ipfs.io/) in all supported runner platforms.
This action aims to provide an environment to test DApps that rely on IPFS.


## Inputs

This action automatically detects runner platform features like the operating system and the processor architecture.

### `ipfs_version`

An exact IPFS version of a [released binary](https://dist.ipfs.io/go-ipfs/versions). Default: `v0.5.1`.


## Example usage

```yml
uses: ibnesayeed/setup-ipfs@master
with:
  ipfs_version: v0.5.1
```
