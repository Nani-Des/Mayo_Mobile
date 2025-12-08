import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class SyncSnapshotModel extends Model {
  static table = 'sync_snapshots';

  @field('uuid') uuid!: string;
  @field('encrypted_data') encryptedData!: string;
  @field('created_at') createdAt!: number;
  @field('hash_checksum') hashChecksum!: string;
  @field('device_signature') deviceSignature!: string;
  @field('vector_clock') vectorClock!: string;
  @field('snapshot_timestamp') snapshotTimestamp!: number;
}