import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class LabResult extends Model {
  static table = 'lab_results'

  @text('server_id') serverId
  @text('patient_id') patientId
  @text('test_name') testName
  @text('value') value
  @text('unit') unit
  @text('status') status
  @date('performed_at') performedAt
  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
