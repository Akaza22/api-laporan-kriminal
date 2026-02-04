import { pool } from '../../config/db';

type ActorRole = 'USER' | 'ADMIN';

interface CreateActivityLogPayload {
  reportId: string;
  actorId: string;
  actorRole: ActorRole;
  action: string;
  entity: string;
  description?: string;
  metadata?: object;
}

export const createActivityLog = async (
  payload: CreateActivityLogPayload
) => {
  const {
    reportId,
    actorId,
    actorRole,
    action,
    entity,
    description,
    metadata,
  } = payload;

  await pool.query(
    `
    INSERT INTO activity_logs
    (
      report_id,
      actor_id,
      actor_role,
      action,
      entity,
      description,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      reportId,
      actorId,
      actorRole,
      action,
      entity,
      description ?? null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
};
