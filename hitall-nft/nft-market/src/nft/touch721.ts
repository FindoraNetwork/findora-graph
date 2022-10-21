import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { NFT, NFTContract } from '../../../../generated/schema'
import { ERC721 } from '../../../../generated/hitall-nft/NFT/ERC721'

import { nftId } from './nftId'
import { newNFT } from './newNFT'
import { newERC721Contract } from '../nft-contract'

export default function touch721(address: Address, tokenId: BigInt, timestamp: BigInt): NFT {
  const contract = ERC721.bind(address)
  const nftContract = (NFTContract.load(address) || newERC721Contract(address)) as NFTContract

  const id = nftId(address, tokenId)
  const nft = (
    NFT.load(id)
    || newERC721NFT(id, address, tokenId, timestamp, contract)
  ) as NFT

  if (timestamp.gt(nft.updatedAt)) nft.updatedAt = timestamp
  nft.save()

  if (!nftContract.uri && nft.uri) {
    nftContract.uri = nft.uri
    nftContract.save()
  }

  return nft
}

function newERC721NFT(
  id: string,
  address: Address,
  tokenId: BigInt,
  createdAt: BigInt,
  contract: ERC721
): NFT {
  const keywords = [] as string[]
  const nftContract = NFTContract.load(address as Bytes)

  if (nftContract) {
    if (nftContract.name) keywords.push(nftContract.name as string)
    if (nftContract.symbol) keywords.push(nftContract.symbol as string)
  }

  keywords.push(address.toHex())

  const tokenURI = contract.try_tokenURI(tokenId)
  let uri = ''
  if (tokenURI.reverted) {
    log.warning('newERC721NFT: query ERC721({})::tokenURI({}) failure', [
      address.toHex(),
      tokenId.toString(),
    ])
  } else {
    keywords.push(tokenURI.value)
    uri = tokenURI.value
  }

  return newNFT(id, address, tokenId, createdAt, uri, keywords.join('__'), 'Collectibles')
}
