import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class PatientRecordModel extends Model {
  static table = 'patient_records';

  @field('uuid') uuid!: string;
  @field('encrypted_data') encryptedData!: string;
  @field('created_at') createdAt!: number;
  @field('hash_checksum') hashChecksum!: string;
  @field('device_signature') deviceSignature!: string;
  @field('vector_clock') vectorClock!: string;
}