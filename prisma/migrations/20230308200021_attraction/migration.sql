-- CreateTable
CREATE TABLE `Attraction` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameLocal` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `address` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `isMustSee` BOOLEAN NOT NULL DEFAULT false,
    `isPredefined` BOOLEAN NOT NULL DEFAULT false,
    `cityId` VARCHAR(191) NOT NULL,

    INDEX `Attraction_cityId_idx`(`cityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
