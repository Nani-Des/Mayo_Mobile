import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class Patient extends Model {
  static table = 'patients'

  @text('server_id') serverId
  @text('first_name') firstName
  @text('last_name') lastName
  @date('date_of_birth') dateOfBirth
  @text('gender') gender
  @text('contact_info') contactInfo
  @readonly @date('created_at') createdAt
  @readonly @date('updated_at') updatedAt
}
