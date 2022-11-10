import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { Bid, Listing, NFTContract } from '../../../../generated/schema'
import { Trade } from '../../../../generated/hitall-nft/Market721/ExchangeNFT721s'

import { addSale as addSaleAnalytic } from '../analytic'
import { newActivity } from '../activity'
import { priceOf } from '../helpers'
import { touch721 } from '../nft'
import { touchAccountCashflow } from '../account-cashflow'
import { touchNFTContract } from '../nft-contract'

import newSale from './newSale'

export default function handle721Trade(ev: Trade): void {
  const timestamp = ev.block.timestamp
  const tx = ev.transaction.hash
  const sender = ev.transaction.from

  const nftAddress = ev.params.nftToken
  const nftTokenId = ev.params.tokenId
  const nftTokenAmount = BigInt.fromI32(1)
  const currency = ev.params.quoteToken
  const seller = ev.params.seller
  const buyer = ev.params.buyer
  const originPrice = ev.params.originPrice
  const price = ev.params.price
  const fee = ev.params.fee
  const royalties = ev.params.royalties
  const earned = price.minus(royalties)

  const nft = touch721(nftAddress, nftTokenId, timestamp)

  let type = price.equals(originPrice) ? 'purchase' : 'bid'

  if (nft.activeListings.length > 0) {
    const listing = Listing.load(nft.activeListings[0])

    if (listing) {
      type = listing.owner.equals(sender) ? 'bid' : 'purchase'

      if (Array.isArray(listing.bids)) {
        for (let i = 0; i < (listing.bids as Bytes[]).length; i++) {
          const bid = Bid.load((listing.bids as Bytes[])[i])

          if (bid) {
            bid.status = bid.bidder.equals(buyer) ? 'accepted' : 'terminated'
            bid.updatedAt = timestamp
            bid.save()
          }
        }
      }

      listing.status = 'sold'
      listing.updatedAt = timestamp
      listing.save()
    }

    nft.activeListings = []
  }

  /// Update NFT statistics

  const usdSpent = priceOf(currency, originPrice)
  const usdEarned = usdSpent.times(earned).div(originPrice)
  const usdFee = usdSpent.times(fee).div(originPrice)
  const usdRoyalty = usdSpent.times(royalties).div(originPrice)

  nft.saleCounts += 1
  nft.saleAmounts = nft.saleAmounts.plus(nftTokenAmount)
  nft.volume = nft.volume.plus(usdSpent)
  nft.fees = nft.fees.plus(usdFee)
  nft.royalties = nft.royalties.plus(usdRoyalty)

  if (!nft.floorPrice || (nft.floorPrice as BigInt).gt(usdSpent)) nft.floorPrice = usdSpent
  if (!nft.priceCeiling || (nft.priceCeiling as BigInt).lt(usdSpent)) nft.priceCeiling = usdSpent

  if (nft.avgPrice) {
    nft.avgPrice = nft.volume.div(nft.saleAmounts)
  } else {
    nft.avgPrice = usdSpent
  }

  nft.save()

  /// Update Collection statistics

  const collection = touchNFTContract(Address.fromBytes(nft.contract)) as NFTContract
  collection.saleCounts += 1
  collection.saleAmounts = collection.saleAmounts.plus(nftTokenAmount)
  collection.volume = collection.volume.plus(usdSpent)
  collection.fees = collection.fees.plus(usdFee)
  collection.royalties = collection.royalties.plus(usdRoyalty)

  if (!collection.floorPrice || (collection.floorPrice as BigInt).gt(usdSpent)) collection.floorPrice = usdSpent
  if (!collection.priceCeiling || (collection.priceCeiling as BigInt).lt(usdSpent)) collection.priceCeiling = usdSpent

  if (collection.avgPrice) {
    collection.avgPrice = collection.volume.div(collection.saleAmounts)
  } else {
    collection.avgPrice = usdSpent
  }

  collection.save()

  /// Update Buyer statistics

  const buyerStatus = touchAccountCashflow(buyer, currency)
  buyerStatus.spent = buyerStatus.spent.plus(originPrice)
  buyerStatus.save()

  /// Update Seller statistics

  const sellerStatus = touchAccountCashflow(seller, currency)
  sellerStatus.earned = sellerStatus.earned.plus(earned)
  sellerStatus.save()

  /// Add Sale entity

  newSale(
    nftAddress,
    nft.id,
    type,
    nftTokenAmount,
    buyer,
    seller,
    currency,
    originPrice,
    timestamp,
    tx
  )

  /// Analytics & Activities

  addSaleAnalytic(nftAddress, timestamp, nftTokenAmount, usdSpent, usdFee)
  newActivity(nft.id, 'sale', timestamp, seller, buyer, currency, originPrice)
}
