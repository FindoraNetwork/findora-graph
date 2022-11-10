import { Address, BigInt, store } from '@graphprotocol/graph-ts'

import { AccountNFT } from '../../../../generated/schema'
import { TransferBatch, TransferSingle } from '../../../../generated/hitall-nft/NFT/ERC1155'

import { touchAccounts } from '../account'
import { newAccountNFT, accountNftId } from '../account-nft'
import touch1155 from './touch1155'

function onERC1155Transfer(
  evAddress: Address,
  timestamp: BigInt,
  from: Address,
  to: Address,
  tokenId: BigInt,
  amount: BigInt
): void {
  /// Deal with "NFT" entity

  const nft = touch1155(evAddress, tokenId, timestamp)

  /// Deal with "AccountNFT" mappings

  touchAccounts([from, to])

  // handle the transfer "from"
  if (from.equals(Address.zero()) || from.equals(evAddress)) {
    // mint:
    nft.total = nft.total.plus(amount)
  } else {
    const linkId = accountNftId(from, nft.id)
    const accountNFT = AccountNFT.load(linkId)

    if (accountNFT) {
      accountNFT.amount = accountNFT.amount.minus(amount)

      if (accountNFT.amount.gt(BigInt.zero())) {
        accountNFT.save()
      } else {
        store.remove('AccountNFT', accountNFT.id.toHexString())
      }
    }
  }

  // handle the transfer "to"
  if (to.equals(Address.zero()) || to.equals(evAddress)) {
    // burn:
    nft.total = nft.total.minus(amount)
  } else {
    const linkId = accountNftId(to, nft.id)
    const accountNFT = (
      AccountNFT.load(linkId) ||
      newAccountNFT(linkId, to, nft.id, BigInt.zero())
    ) as AccountNFT
    accountNFT.amount = accountNFT.amount.plus(amount)
    accountNFT.save()
  }

  nft.save()
}

export function handleERC1155SingleTransfer(event: TransferSingle): void {
  onERC1155Transfer(
    event.address,
    event.block.timestamp,
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value
  )
}

export function handleERC1155BatchTransfer(event: TransferBatch): void {
  const evAddress = event.address
  const timestamp = event.block.timestamp

  for (let i = 0; i < event.params.ids.length; i++) {
    onERC1155Transfer(
      evAddress,
      timestamp,
      event.params.from,
      event.params.to,
      event.params.ids[i],
      event.params.values[i]
    )
  }
}
