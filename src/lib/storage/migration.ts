// lib/storage/migration.ts

import { SyncRecord } from '@/types/sync';

interface LegacyPendingScore {
  student_id: string;
  assessment_id: string;
  score: number | null;
  synced?: boolean;
  updated_at?: string;
  // Missing: id, sync_attempts, last_sync_error
}

interface LegacyCache {
  scores: LegacyPendingScore[];
  lastUpdated?: string;
  version?: number;
}

/**
 * Migrate existing localStorage data from Session 3 format to Session 4 format
 * Adds id, sync_attempts, and last_sync_error fields to each record
 */
export function migratePendingScores(classId: string): boolean {
  const key = `nexaforge_scores_${classId}`;
  
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      console.log(`[Migration] No data found for class ${classId}`);
      return false;
    }

    const cache: LegacyCache = JSON.parse(data);
    
    if (!cache.scores || !Array.isArray(cache.scores) || cache.scores.length === 0) {
      console.log(`[Migration] Empty or invalid cache for class ${classId}`);
      return false;
    }

    let migrated = false;

    cache.scores = cache.scores.map((s: LegacyPendingScore): SyncRecord => {
      // Check if record needs migration
      const needsMigration = !('id' in s) || !('sync_attempts' in s);
      
      if (needsMigration) {
        migrated = true;
      }

      return {
        id: (s as any).id || crypto.randomUUID(),
        student_id: s.student_id,
        assessment_id: s.assessment_id,
        score: s.score,
        synced: s.synced ?? false,
        updated_at: s.updated_at || new Date().toISOString(),
        sync_attempts: (s as any).sync_attempts || 0,
        last_sync_error: (s as any).last_sync_error || undefined,
      };
    });

    if (migrated) {
      localStorage.setItem(key, JSON.stringify(cache));
      console.log(`[Migration] Migrated ${cache.scores.length} records for class ${classId}`);
    } else {
      console.log(`[Migration] Records for class ${classId} already up to date`);
    }

    return migrated;
  } catch (error) {
    console.error(`[Migration] Failed to migrate scores for class ${classId}:`, error);
    return false;
  }
}

/**
 * Run migration for all known class IDs in localStorage
 */
export function migrateAllClasses(): void {
  const prefix = 'nexaforge_scores_';
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const classId = key.replace(prefix, '');
        migratePendingScores(classId);
      }
    }
    console.log('[Migration] Completed migration check for all classes');
  } catch (error) {
    console.error('[Migration] Failed during bulk migration:', error);
  }
}

/**
 * Check if migration is needed for a specific class
 */
export function isMigrationNeeded(classId: string): boolean {
  const key = `nexaforge_scores_${classId}`;
  
  try {
    const data = localStorage.getItem(key);
    if (!data) return false;

    const cache = JSON.parse(data);
    if (!cache.scores || cache.scores.length === 0) return false;

    // Check if any record is missing the new fields
    return cache.scores.some(
      (s: any) => !('id' in s) || !('sync_attempts' in s)
    );
  } catch {
    return false;
  }
}
