/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { prisma } from "../src/server/db";
import countries from "./data/countries.json";
import geoNames from "./data/geonames-all-cities-with-a-population-1000.json";

async function main() {
  // countries is an open source data set from https://restcountries.com/v3.1/all
  countries.map(async (item) => {
    await prisma.country.upsert({
      where: {
        cca2: item.cca2,
      },
      create: {
        cca2: item.cca2,
        cca3: item.cca3,
        ccn3: item.ccn3,
        nameCommon: item.name.common,
        nameOfficial: item.name.official,
        region: item.region,
        subregion: item.subregion,
        flagPng: item.flags.png,
      },
      update: {},
    });
  });

  // geo names is an open source data set from https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000
  // last modified date is February 10, 2023.
  for (let index = 0; index < geoNames.length; index++) {
    console.log(`geoitem ${index + 1} of ${geoNames.length}`);
    const item = geoNames[index];
    await prisma.city.upsert({
      where: {
        id: item.geoname_id,
      },
      create: {
        id: item.geoname_id,
        name: item.name,
        countryCode: item.country_code,
        admin1Code: item.admin1_code,
        admin2Code: item.admin2_code,
        admin3Code: item.admin3_code,
        admin4Code: item.admin4_code,
        population: item.population,
        latitude: item.coordinates.lat,
        longitude: item.coordinates.lon,
        modificationDate: new Date(item.modification_date),
        alternateNames: item.alternate_names
          ?.map((name: string) => name)
          .join("|"),
      },
      update: {
        name: item.name,
        countryCode: item.country_code,
        admin1Code: item.admin1_code,
        admin2Code: item.admin2_code,
        admin3Code: item.admin3_code,
        admin4Code: item.admin4_code,
        population: item.population,
        latitude: item.coordinates.lat,
        longitude: item.coordinates.lon,
        modificationDate: new Date(item.modification_date),
        alternateNames: item.alternate_names
          ?.map((name: string) => name)
          .join("|"),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
