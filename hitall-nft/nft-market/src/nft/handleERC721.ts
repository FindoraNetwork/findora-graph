import { Address, BigInt, store } from '@graphprotocol/graph-ts'

import { AccountNFT, NFTContract } from '../../../../generated/schema'
import { Transfer } from '../../../../generated/hitall-nft/NFT/ERC721'

import { touchAccounts } from '../account'
import { newAccountNFT, accountNftId } from '../account-nft'
import { newActivity } from '../activity'
import touch721 from './touch721'
import { touchNFTContract } from '../nft-contract'

export function handleERC721Transfer(event: Transfer): void {
  const evAddress = event.address
  const timestamp = event.block.timestamp
  const from = event.params.from
  const to = event.params.to
  const tokenId = event.params.tokenId

  /// Deal with "NFT" entity

  const nft = touch721(evAddress, tokenId, timestamp)

  /// Deal with "AccountNFT" mappings

  touchAccounts([from, to])

  // handle the transfer "from"
  if (from.equals(Address.zero()) || from.equals(evAddress)) {
    // mint:
    nft.total = BigInt.fromI32(1)
    const contract = touchNFTContract(evAddress) as NFTContract
    if (contract) {
      contract.nftCounts = contract.nftCounts.plus(BigInt.fromI32(1))
      contract.save()
    }

    newActivity(nft.id, 'mint', timestamp, null, to)
  } else {
    const linkId = accountNftId(from, nft.id)
    const accountNFT = AccountNFT.load(linkId)

    // for ERC721, we don't have to consider the amounts change, just remove entire m-to-m links
    if (accountNFT) store.remove('AccountNFT', accountNFT.id.toHexString())

    if (to.notEqual(Address.zero()) && to.notEqual(evAddress)) {
      newActivity(nft.id, 'transfer', timestamp, from, to)
    }
  }

  // handle the transfer "to"
  if (to.equals(Address.zero()) || to.equals(evAddress)) {
    // burn:
    nft.total = BigInt.zero()

    const contract = touchNFTContract(evAddress) as NFTContract
    if (contract && contract.nftCounts.gt(BigInt.zero())) {
      contract.nftCounts = contract.nftCounts.minus(BigInt.fromI32(1))
      contract.save()
    }
    newActivity(nft.id, 'burn', timestamp, from)
  } else {
    const linkId = accountNftId(to, nft.id)
    newAccountNFT(linkId, to, nft.id, BigInt.fromI32(1))
  }

  nft.save()
}
