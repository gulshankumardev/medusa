import { ProductTag } from "@models"
import { DAL, FindConfig, ProductTypes, SharedContext } from "@medusajs/types"
import { buildQuery } from "../utils"

type InjectedDependencies = {
  productTagRepository: DAL.RepositoryService
}

export default class ProductTagService {
  protected readonly productTagRepository_: DAL.RepositoryService

  constructor({ productTagRepository }: InjectedDependencies) {
    this.productTagRepository_ = productTagRepository
  }

  async list<T = ProductTag>(
    filters: ProductTypes.FilterableProductTagProps = {},
    config: FindConfig<ProductTypes.ProductTagDTO> = {},
    sharedContext?: SharedContext
  ): Promise<T[]> {
    const queryOptions = buildQuery<T>(filters, config)
    queryOptions.where ??= {}

    if (filters.value) {
      queryOptions.where["value"] = { $ilike: filters.value }
    }

    return await this.productTagRepository_.find<T>(queryOptions)
  }
}
