-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Penalty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Penalty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Penalty" ("amount", "id", "reason", "status", "timestamp", "userId") SELECT "amount", "id", "reason", "status", "timestamp", "userId" FROM "Penalty";
DROP TABLE "Penalty";
ALTER TABLE "new_Penalty" RENAME TO "Penalty";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
