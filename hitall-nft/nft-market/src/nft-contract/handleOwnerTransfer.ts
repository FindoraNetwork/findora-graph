import { Address, Bytes } from '@graphprotocol/graph-ts'

import { CollectionOwnershipTransferred } from '../../../../generated/hitall-nft/CMS/MarketManagement'

import { NFTContract } from '../../../../generated/schema'

import { touchAccounts } from '../account'

export default function handleOwnerTransfer(event: CollectionOwnershipTransferred): void {
  const collection = event.params.collection
  const owner = event.params.newOwner

  const nftContract = NFTContract.load(collection)

  if (nftContract) {
    if (nftContract.creator && (nftContract.creator as Bytes).notEqual(Address.empty())) {
      touchAccounts([Address.fromBytes(nftContract.creator as Bytes), owner])
    } else {
      touchAccounts([owner])
    }

    nftContract.creator = owner
    nftContract.save()
  }
}
