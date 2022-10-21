import { TagLevel } from '../../../../generated/hitall-nft/CMS/MarketManagement'

import touchCategory from './touchCategory'

export default function handleTagLevel(event: TagLevel): void {
  const tag = event.params.tag
  const level = event.params.level

  const category = touchCategory(tag)
  category.level = level
  category.save()
}
