import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import zlib from "zlib";

export interface RestoreArchiveResult {
  success: boolean;
  message: string;
  archiveFound: boolean;
  archiveSizeMB?: number;
  collectionsRestored?: Record<string, number>;
  error?: string;
}

/**
 * Server function to inspect and restore database archive DATA/jobroomdb.archive into MongoDB.
 */
export const restoreArchiveFn = createServerFn({ method: "POST" }).handler(async (): Promise<RestoreArchiveResult> => {
  try {
    const db = await connectToDatabase();
    const archivePath = path.join(process.cwd(), "DATA", "jobroomdb.archive");

    if (!fs.existsSync(archivePath)) {
      return {
        success: false,
        archiveFound: false,
        message: `Archive file not found at ${archivePath}`,
      };
    }

    const stat = fs.statSync(archivePath);
    const sizeMB = Number((stat.size / (1024 * 1024)).toFixed(2));
    let buffer = fs.readFileSync(archivePath);

    // Decompress if gzip
    if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
      console.log("Decompressing gzip database archive...");
      buffer = zlib.gunzipSync(buffer);
    }

    const BSON = mongoose.mongo.BSON;
    const collectionsRestored: Record<string, number> = {};
    let offset = 0;
    const dbNative = db.connection.db;

    if (!dbNative) {
      throw new Error("Database connection is not ready.");
    }

    // Parse BSON documents embedded in the archive
    let currentCollectionName = "restored_data";
    const batchByCollection: Record<string, Array<Record<string, unknown>>> = {};

    while (offset < buffer.length - 4) {
      try {
        const docSize = buffer.readInt32LE(offset);
        if (docSize > 4 && docSize <= 16 * 1024 * 1024 && offset + docSize <= buffer.length) {
          try {
            const rawSub = buffer.subarray(offset, offset + docSize);
            const doc = BSON.deserialize(rawSub) as Record<string, unknown>;

            if (doc && typeof doc === "object") {
              const record = doc as Record<string, unknown>;
              const nsVal = record["ns"];
              if (typeof nsVal === "string") {
                const parts = nsVal.split(".");
                if (parts.length > 1) {
                  currentCollectionName = parts.slice(1).join(".");
                }
              }

              const docId = record["_id"];
              if (docId !== undefined && docId !== null) {
                let targetArr = batchByCollection[currentCollectionName];
                if (!targetArr) {
                  targetArr = [];
                  batchByCollection[currentCollectionName] = targetArr;
                }
                targetArr.push(record);
              }
              offset += docSize;
              continue;
            }
          } catch {
            // Not a BSON doc at offset
          }
        }
      } catch {
        // Continue scanning
      }
      offset++;
    }

    // Insert restored document batches into MongoDB collections
    for (const [collName, docs] of Object.entries(batchByCollection)) {
      if (docs.length > 0) {
        const collection = dbNative.collection(collName);
        let inserted = 0;
        for (const doc of docs) {
          try {
            await collection.updateOne(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { _id: doc["_id"] as any },
              { $set: doc },
              { upsert: true }
            );
            inserted++;
          } catch {
            // ignore write error
          }
        }
        collectionsRestored[collName] = inserted;
      }
    }

    return {
      success: true,
      archiveFound: true,
      archiveSizeMB: sizeMB,
      collectionsRestored,
      message: `Successfully restored archive (${sizeMB} MB) into MongoDB collections.`,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      archiveFound: true,
      error: errMessage,
      message: "Failed to restore database archive.",
    };
  }
});

export interface CollectionSummary {
  name: string;
  count: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sampleDocs: Array<Record<string, any>>;
}

/**
 * Server function to fetch all collections and sample records stored in MongoDB.
 */
export const getRestoredDataFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await connectToDatabase();
    const dbNative = db.connection.db;

    if (!dbNative) {
      return { success: false, collections: [] };
    }

    const colls = await dbNative.listCollections().toArray();
    const collections: CollectionSummary[] = [];

    for (const collInfo of colls) {
      const collName = collInfo.name;
      if (collName.startsWith("system.")) continue;

      const collection = dbNative.collection(collName);
      const count = await collection.countDocuments();
      const docs = await collection.find({}).limit(10).toArray();

      collections.push({
        name: collName,
        count,
        sampleDocs: docs.map((d) => ({
          ...d,
          _id: String(d._id),
        })),
      });
    }

    return {
      success: true,
      collections: collections.sort((a, b) => b.count - a.count),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      collections: [],
      error: errMessage,
    };
  }
});
