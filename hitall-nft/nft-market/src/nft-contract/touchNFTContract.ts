import { Address, log } from '@graphprotocol/graph-ts'

import { MergedNFT } from '../../../../generated/hitall-nft/NFT/MergedNFT'
import { NFTContract } from '../../../../generated/schema'

import { InterfaceId721, InterfaceId1155 } from './interfaceId'
import { newERC721Contract } from './newERC721Contract'
import { newERC1155Contract } from './newERC1155Contract'

export default function touchNFTContract(address: Address): NFTContract|null {
  return NFTContract.load(address) || newNFTContract(address)
}

function newNFTContract(address: Address): NFTContract|null {
  const tester = MergedNFT.bind(address)

  const isERC721 = tester.try_supportsInterface(InterfaceId721)
  if (!isERC721.reverted && isERC721.value) return newERC721Contract(address)

  const isERC1155 = tester.try_supportsInterface(InterfaceId1155)
  if (!isERC1155.reverted && isERC1155.value) return newERC1155Contract(address)

  log.warning('newNFTContract: contract {} support neither ERC721 nor ERC1155 interfaceId, fail to new contract entity', [address.toHex()])
  return null
}
