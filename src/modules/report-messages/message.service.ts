import { pool } from '../../config/db';
import { AppError } from '../../utils/appError';
import { createActivityLog } from '../activity-logs/activity-logs.service';

export const getMessagesByReport = async (reportId: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      rm.id,
      rm.message,
      rm.sender_role,
      rm.created_at,
      u.full_name AS sender_name
    FROM report_messages rm
    JOIN users u ON u.id = rm.sender_id
    WHERE rm.report_id = $1
    ORDER BY rm.created_at ASC
    `,
    [reportId]
  );

  return rows;
};

interface CreateMessageParams {
  reportId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  message: string;
  close?: boolean;
}

export const createMessage = async ({
  reportId,
  senderId,
  senderRole,
  message,
  close = false,
}: CreateMessageParams) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ cek report
    const reportRes = await client.query(
      `SELECT status FROM reports WHERE id = $1`,
      [reportId]
    );

    if (reportRes.rows.length === 0) {
      throw new AppError('Report not found', 404);
    }

    const currentStatus: string = reportRes.rows[0].status;
    let nextStatus: string | null = null;

    // 2️⃣ insert message
    const messageRes = await client.query(
      `
      INSERT INTO report_messages
      (report_id, sender_id, sender_role, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, message, sender_role, created_at
      `,
      [reportId, senderId, senderRole, message]
    );

    const createdMessage = messageRes.rows[0];

    // 3️⃣ AUTO STATUS UPDATE (ADMIN ONLY)
    if (senderRole === 'ADMIN') {
      if (currentStatus === 'SUBMITTED') {
        nextStatus = 'IN_PROGRESS';
      }

      if (close === true) {
        nextStatus = 'RESOLVED';
      }

      if (nextStatus && nextStatus !== currentStatus) {
        await client.query(
          `
          UPDATE reports
          SET status = $1
          WHERE id = $2
          `,
          [nextStatus, reportId]
        );

        // 🧾 ACTIVITY LOG: STATUS UPDATE
        await client.query(
          `
          INSERT INTO activity_logs
          (report_id, actor_id, actor_role, action, entity, description, metadata)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          `,
          [
            reportId,
            senderId,
            senderRole,
            'UPDATE_STATUS',
            'REPORT',
            `Report status changed from ${currentStatus} to ${nextStatus}`,
            JSON.stringify({
              from: currentStatus,
              to: nextStatus,
            }),
          ]
        );
      }
    }

    // 🧾 ACTIVITY LOG: SEND MESSAGE
    await client.query(
      `
      INSERT INTO activity_logs
      (report_id, actor_id, actor_role, action, entity, description, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        reportId,
        senderId,
        senderRole,
        'SEND_MESSAGE',
        'MESSAGE',
        senderRole === 'ADMIN'
          ? 'Admin replied to report'
          : 'User sent a message',
        JSON.stringify({
          message_id: createdMessage.id,
        }),
      ]
    );

    await client.query('COMMIT');

    return createdMessage;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
