import { pool } from '../../config/db';

interface TimelineResult {
  data: any[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const getReportTimelineCursor = async (
  reportId: string,
  cursor?: string,
  limit = 20
): Promise<TimelineResult> => {
  const values: any[] = [reportId];
  let cursorCondition = '';

  if (cursor) {
    values.push(cursor);
    cursorCondition = `AND created_at < $${values.length}`;
  }

  /**
   * NOTE:
   * - UNION ALL messages + activity_logs
   * - LIMIT + 1 → buat cek masih ada data atau nggak
   */
  const { rows } = await pool.query(
    `
    SELECT *
    FROM (
      -- MESSAGE
      SELECT
        'MESSAGE' AS type,
        rm.id,
        rm.message,
        rm.sender_role,
        u.full_name AS sender_name,
        rm.created_at
      FROM report_messages rm
      JOIN users u ON u.id = rm.sender_id
      WHERE rm.report_id = $1

      UNION ALL

      -- ACTIVITY LOG
      SELECT
        'ACTIVITY' AS type,
        al.id,
        al.description AS message,
        NULL AS sender_role,
        NULL AS sender_name,
        al.created_at
      FROM activity_logs al
      WHERE al.report_id = $1
    ) timeline
    WHERE 1=1
    ${cursorCondition}
    ORDER BY created_at DESC
    LIMIT ${limit + 1}
    `,
    values
  );

  const hasNext = rows.length > limit;
  const data = hasNext ? rows.slice(0, limit) : rows;

  const nextCursor =
    data.length > 0
      ? data[data.length - 1].created_at
      : null;

  return {
    data,
    nextCursor,
    hasNext,
  };
};
