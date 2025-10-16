import type { PrismaConfig } from "prisma";

const config: PrismaConfig = {
    // Seed configuration - moved from package.json
    migrations: {
        seed: "tsx prisma/seed.ts",
    },
};

export default config;
