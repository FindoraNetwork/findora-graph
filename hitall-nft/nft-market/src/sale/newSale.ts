import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Sale } from '../../../../generated/schema'

export default function newSale(
  nftAddress: Address,
  nftId: string,
  type: string, // 'bid' | 'purchase'
  amount: BigInt,
  buyer: Address,
  seller: Address,
  currency: Address,
  price: BigInt,
  timestamp: BigInt,
  tx: Bytes
): Sale {
  const sale = new Sale(nftAddress.concat(buyer).concat(tx))

  sale.type = type
  sale.nft = nftId
  sale.amount = amount

  sale.buyer = buyer
  sale.seller = seller

  sale.currency = currency
  sale.price = price

  sale.timestamp = timestamp
  sale.txHash = tx

  sale.save()
  return sale
}
