import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import { NFT, NFTContractCategory } from '../../../../generated/schema'

import { normalize } from '../helpers'
import { touchCategory } from '../category'
import NFTContractCategoryId from '../nft-contract-category/NFTContractCategoryId'

export function newNFT(
  id: string,
  address: Address,
  tokenId: BigInt,
  createdAt: BigInt,
  uri: string = '',
  searchKeywords: string = '',
  tag: string = ''
): NFT {
  log.debug('newNFT: creating NFT entity {}', [id])

  const nft = new NFT(id)
  nft.contract = address
  nft.tokenId = tokenId
  nft.createdAt = createdAt
  nft.updatedAt = createdAt
  nft.total = BigInt.zero()

  nft.saleCounts = 0
  nft.saleAmounts = BigInt.zero()
  nft.volume = BigInt.zero()
  nft.fees = BigInt.zero()
  nft.royalties = BigInt.zero()

  nft.activeListings = []

  nft.searchKeywords = searchKeywords

  if (uri) nft.uri = normalize(uri)

  nft.save()

  if (tag) {
    const category = touchCategory(tag)
    const id = NFTContractCategoryId(address, category.id)
    const link = new NFTContractCategory(id)
    link.tag = category.id
    link.contract = address
    link.save()
  }

  return nft
}
