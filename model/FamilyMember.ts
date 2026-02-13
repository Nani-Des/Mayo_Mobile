import { Model, Q } from '@nozbe/watermelondb'
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators'

export default class FamilyMember extends Model {
  static table = 'family_members'


  @text('server_id') serverId!: string
  @text('family_id') familyId!: string
  @text('user_id') userId!: string
  @text('first_name') firstName!: string
  @text('last_name') lastName!: string
  @text('relationship') relationship!: string
  @date('date_of_birth') dateOfBirth!: number
  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number
}
