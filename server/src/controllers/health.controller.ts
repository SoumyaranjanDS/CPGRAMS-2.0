import { Request, Response } from 'express';
import { getDBStatus } from '../config/db.js';
import { getCacheStatus } from '../config/redis.js';

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const dbStatus = getDBStatus();
  const cacheStatus = getCacheStatus();

  res.status(200).json({
    success: true,
    platform: 'CPGRAMS 2.0 - Public Grievance Digital Infrastructure',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'OPERATIONAL',
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version,
    },
    services: {
      database: {
        status: dbStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED_FALLBACK_ACTIVE',
        host: dbStatus.host,
      },
      cache: {
        status: 'ACTIVE',
        driver: cacheStatus.driver,
        isLiveRedis: cacheStatus.isLiveRedis,
      },
      intakeEngine: {
        status: 'ONLINE',
        autosave: 'ENABLED',
        queue: 'ACTIVE',
      },
    },
  });
};
