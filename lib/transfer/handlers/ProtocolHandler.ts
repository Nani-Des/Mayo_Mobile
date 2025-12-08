export interface EncryptedRecord {
  encrypted: string;
  iv: string;
  metadata: any;
}

export abstract class ProtocolHandler {
  protected sessionId: string | null = null;
  protected ephemeralKey: string | null = null;

  abstract initialize(sessionId: string, ephemeralKey: string): Promise<void>;
  abstract sendRecord(record: EncryptedRecord): Promise<void>;
  abstract finalize(): Promise<void>;
  abstract cancel(): Promise<void>;
}