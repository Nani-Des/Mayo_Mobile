import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Medication extends Model {
  static table = 'medications'

  @text('server_id') serverId
  @text('patient_id') patientId
  @text('name') name
  @text('dosage') dosage
  @text('frequency') frequency
  @text('status') status
  @date('prescribed_at') prescribedAt
  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
