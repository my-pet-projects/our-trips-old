-- CreateTable
CREATE TABLE `Country` (
    `cca2` VARCHAR(2) NOT NULL,
    `cca3` VARCHAR(3) NOT NULL,
    `ccn3` VARCHAR(3) NULL,
    `nameCommon` VARCHAR(191) NOT NULL,
    `nameOfficial` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `subregion` VARCHAR(191) NULL,
    `flagPng` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cca2`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `alternateNames` TEXT NULL,
    `countryCode` VARCHAR(2) NOT NULL,
    `admin1Code` VARCHAR(191) NULL,
    `admin2Code` VARCHAR(191) NULL,
    `admin3Code` VARCHAR(191) NULL,
    `admin4Code` VARCHAR(191) NULL,
    `modificationDate` DATE NOT NULL,
    `population` INTEGER NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,

    INDEX `City_countryCode_idx`(`countryCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
