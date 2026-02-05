import { pool } from '../../config/db';

export const getDashboardAnalytics = async () => {
  /**
   * 1️⃣ SUMMARY CARDS
   */
  const summaryQuery = `
    SELECT
      COUNT(*) AS total_reports,
      COUNT(*) FILTER (
        WHERE status IN ('SUBMITTED', 'IN_PROGRESS')
      ) AS pending_reports,
      COUNT(*) FILTER (
        WHERE status = 'RESOLVED'
      ) AS resolved_reports
    FROM reports
  `;

  const usersQuery = `
    SELECT COUNT(*) AS total_users
    FROM users
    WHERE role = 'USER'
  `;

  /**
   * 2️⃣ MONTHLY TRENDS (last 6 months)
   */
  const monthlyTrendsQuery = `
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
      COUNT(*) AS incoming,
      COUNT(*) FILTER (WHERE status = 'RESOLVED') AS resolved
    FROM reports
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `;

  /**
   * 3️⃣ CATEGORY DISTRIBUTION
   */
  const categoryQuery = `
    SELECT
      category AS name,
      COUNT(*)::int AS value
    FROM reports
    GROUP BY category
    ORDER BY value DESC
  `;

  const [
    summaryResult,
    usersResult,
    monthlyResult,
    categoryResult,
  ] = await Promise.all([
    pool.query(summaryQuery),
    pool.query(usersQuery),
    pool.query(monthlyTrendsQuery),
    pool.query(categoryQuery),
  ]);

  return {
    summary: {
      total_reports: Number(summaryResult.rows[0].total_reports),
      pending_reports: Number(summaryResult.rows[0].pending_reports),
      resolved_reports: Number(summaryResult.rows[0].resolved_reports),
      total_users: Number(usersResult.rows[0].total_users),
      growth_percentage: null, // optional nanti
    },
    monthly_trends: monthlyResult.rows,
    category_distribution: categoryResult.rows,
  };
};
