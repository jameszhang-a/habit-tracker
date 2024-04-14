-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HabitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAtV2" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "weekKey" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_HabitLog" ("completed", "createdAt", "date", "habitId", "id", "updatedAt", "weekKey") SELECT "completed", "createdAt", "date", "habitId", "id", "updatedAt", "weekKey" FROM "HabitLog";
DROP TABLE "HabitLog";
ALTER TABLE "new_HabitLog" RENAME TO "HabitLog";
CREATE INDEX "HabitLog_habitId_idx" ON "HabitLog"("habitId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
