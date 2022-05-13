import { PoolClient } from "pg";
import { ImmersionApplicationExportQueries } from "../../../domain/immersionApplication/ports/ImmersionApplicationExportQueries";
import { ImmersionApplicationRawBeforeExportVO } from "../../../domain/immersionApplication/valueObjects/ImmersionApplicationRawBeforeExportVO";
import { optional } from "./pgUtils";

export class PgImmersionApplicationExportQueries
  implements ImmersionApplicationExportQueries
{
  constructor(private client: PoolClient) {}
  public async getAllApplicationsForExport(): Promise<
    ImmersionApplicationRawBeforeExportVO[]
  > {
    const pgResult = await this.client.query(`
      SELECT *, immersion_applications.status as immersion_applications_status, agencies.status as agency_status
      FROM immersion_applications
      LEFT JOIN agencies ON agencies.id = immersion_applications.agency_id
      LEFT JOIN public_appellations_data AS pad ON pad.ogr_appellation = immersion_applications.immersion_appellation
      `);
    return pgResult.rows.map(
      (row) =>
        new ImmersionApplicationRawBeforeExportVO({
          agencyName: row.name,
          status: row.immersion_applications_status,
          postalCode: row.postal_code,
          email: row.email,
          phone: row.phone,
          firstName: row.first_name,
          lastName: row.last_name,
          emergencyContact: row.emergency_contact,
          emergencyContactPhone: row.emergency_contact_phone,
          dateSubmission: new Date(row.date_submission).toISOString(),
          dateStart: new Date(row.date_start).toISOString(),
          dateEnd: new Date(row.date_end).toISOString(),
          businessName: row.business_name,
          mentor: row.mentor,
          mentorPhone: row.mentor_phone,
          mentorEmail: row.mentor_email,
          immersionObjective: row.immersion_objective,
          immersionProfession: row.libelle_appellation_court,
          beneficiaryAccepted: row.beneficiary_accepted,
          enterpriseAccepted: row.enterprise_accepted,
          schedule: row.schedule,
          siret: row.siret,
          workConditions: optional(row.work_conditions),
        }),
    );
  }
}
