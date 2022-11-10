import { store } from '@graphprotocol/graph-ts'

import { DetachTag } from '../../../../generated/hitall-nft/CMS/MarketManagement'

import { touchCategory } from '../category'
import NFTContractCategoryId from './NFTContractCategoryId'

export default function handleDetachTag(event: DetachTag): void {
  const address = event.params.collection
  const tag = event.params.tag

  const category = touchCategory(tag)
  const id = NFTContractCategoryId(address, category.id)

  store.remove('NFTContractCategory', id.toHex())
}
