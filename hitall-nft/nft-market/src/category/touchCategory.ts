import { Bytes, log } from '@graphprotocol/graph-ts'

import { Category } from '../../../../generated/schema';

export default function touchCategory(name: string): Category {
  const id = name.trim().split(' ').join('-').toLowerCase()

  return (
    Category.load(id)
    || newCategory(id, name)
  ) as Category;
}

function newCategory(id: string, name: string): Category {
  const category = new Category(id)
  category.text = name
  category.level = 0
  category.save()

  return category
}
