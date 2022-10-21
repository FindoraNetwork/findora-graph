import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { NFT, NFTContract } from '../../../../generated/schema'
import { ERC1155 } from '../../../../generated/hitall-nft/NFT/ERC1155'

import { nftId } from './nftId'
import { newNFT } from './newNFT'
import { newERC1155Contract } from '../nft-contract'

export default function touch1155(address: Address, tokenId: BigInt, timestamp: BigInt): NFT {
  const contract = ERC1155.bind(address)
  const nftContract = (NFTContract.load(address) || newERC1155Contract(address)) as NFTContract

  const id = nftId(address, tokenId)
  const nft = (
    NFT.load(id)
    || newERC1155NFT(id, address, tokenId, timestamp, contract)
  ) as NFT

  if (timestamp.gt(nft.updatedAt)) nft.updatedAt = timestamp
  nft.save()

  if (!nftContract.uri && nft.uri) {
    nftContract.uri = nft.uri
    nftContract.save()
  }

  return nft
}

function newERC1155NFT(
  id: string,
  address: Address,
  tokenId: BigInt,
  createdAt: BigInt,
  contract: ERC1155
): NFT {
  const keywords = [] as string[]
  const nftContract = NFTContract.load(address as Bytes)

  if (nftContract) {
    // note: ERC1155 standard doesn't include name & symbol
    if (nftContract.name) keywords.push(nftContract.name as string)
    if (nftContract.symbol) keywords.push(nftContract.symbol as string)
  }

  keywords.push(address.toHex())

  const tokenURI = contract.try_uri(tokenId)
  let uri = ''
  if (tokenURI.reverted) {
    log.warning('newERC1155NFT: query ERC1155({})::uri({}) failure', [
      address.toHex(),
      tokenId.toString(),
    ])
  } else {
    keywords.push(tokenURI.value)
    uri = tokenURI.value
  }

  return newNFT(id, address, tokenId, createdAt, uri, keywords.join('__'), '')
}
