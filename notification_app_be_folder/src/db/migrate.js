import { gxPool } from "../config/storage.js";
import { zxLog } from "../middleware/logAdapter.js";

export const hxRunMigrations = async () => {
    const qk = `
        CREATE TABLE IF NOT EXISTS nx_students (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id VARCHAR(64) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS nx_notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id VARCHAR(64) NOT NULL,
            notification_type VARCHAR(32) NOT NULL CHECK (notification_type IN ('Event', 'Result', 'Placement')),
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            priority_score NUMERIC(10,4) DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_nx_student FOREIGN KEY (student_id)
                REFERENCES nx_students(student_id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_nx_notif_student_unread
            ON nx_notifications (student_id, is_read, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_nx_notif_type
            ON nx_notifications (notification_type, created_at DESC);
    `;

    try {
        await gxPool.query(qk);
        await zxLog("db", "info", "Database migrations completed successfully");
    } catch (ek) {
        await zxLog("db", "fatal", `Migration failure: ${ek.message}`);
        throw ek;
    }
};
