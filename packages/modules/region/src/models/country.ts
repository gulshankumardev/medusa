import { model } from "@medusajs/utils"
import Region from "./region"

const Country = model.define(
  { name: "Country", tableName: "region_country" },
  {
    iso_2: model.text().primaryKey(),
    iso_3: model.text(),
    num_code: model.text(),
    name: model.text(),
    display_name: model.text(),
    region: model.belongsTo(() => Region, { mappedBy: "countries" }).nullable(),
    metadata: model.json().nullable(),
  }
)

// .indexes([{ fields: ["region_id", "iso_2"], unique: true, name: "IDX_region_country_region_id_iso_2_unique" ])

export default Country
