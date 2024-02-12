import { moduleProviderLoader } from "@medusajs/modules-sdk"
import { LoaderOptions, ModuleProvider, ModulesSdkTypes } from "@medusajs/types"
import { Lifetime, asFunction, asValue } from "awilix"

import * as providers from "../providers"

const registrationFn = async (klass, container, pluginOptions) => {
  Object.entries(pluginOptions.config).map(([k, v]) => {
    const key = `pp_${klass.PROVIDER}_${k}`
    container.register({
      [key]: asFunction((cradle) => new klass(cradle, pluginOptions), {
        lifetime: klass.LIFE_TIME || Lifetime.SINGLETON,
      }).inject(() => ({ config: v })),
    })

    container.registerAdd("payment_providers", asValue(key))
  })
}

export default async ({
  container,
  options,
}: LoaderOptions<
  (
    | ModulesSdkTypes.ModuleServiceInitializeOptions
    | ModulesSdkTypes.ModuleServiceInitializeCustomDataLayerOptions
  ) & { providers: ModuleProvider[] }
>): Promise<void> => {
  // Local providers
  for (const provider of Object.values(providers)) {
    await registrationFn(provider, container, {})
  }

  await moduleProviderLoader({
    container,
    providers: options?.providers || [],
    registerServiceFn: registrationFn,
  })
}
