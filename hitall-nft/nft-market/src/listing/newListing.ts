import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Listing } from '../../../../generated/schema'

import { touchAccounts } from '../account'
import { touchCurrency } from '../currency'
import { listing721Id, listing1155Id } from './listingId'


export default function newListing(
  nftStandard: string,
  nftAddress: Address,
  nftId: string,
  owner: Address,
  tx: Bytes,
  timestamp: BigInt,
  amount: BigInt,
  currency: Address,
  price: BigInt,
  type: string = 'All',
  orderId: BigInt|null = null,
): Listing {
  touchAccounts([owner])
  touchCurrency(currency)

  const listing = new Listing(nftStandard === '1155'
    ? listing1155Id(nftAddress, orderId as BigInt)
    : listing721Id(nftId, tx)
  )

  listing.owner = owner
  listing.nft = nftId
  listing.collection = nftAddress
  listing.amount = amount
  listing.status = 'open'
  listing.type = type
  listing.currency = currency
  listing.price = price
  listing.createdAt = timestamp
  listing.updatedAt = timestamp
  if (orderId) listing.orderId = orderId

  listing.save()
  return listing
}

