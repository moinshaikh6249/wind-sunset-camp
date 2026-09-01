import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const sanitizeMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return uri;

  const protocolMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)/i);
  if (!protocolMatch) return uri;

  const protocol = protocolMatch[1];
  const restOfUri = uri.slice(protocol.length);

  const pathStartIdx = restOfUri.search(/[\/\?]/);
  const authAndHosts = pathStartIdx !== -1 ? restOfUri.slice(0, pathStartIdx) : restOfUri;
  const pathAndQuery = pathStartIdx !== -1 ? restOfUri.slice(pathStartIdx) : '';

  const lastAtIdx = authAndHosts.lastIndexOf('@');
  if (lastAtIdx === -1) return uri;

  const userPass = authAndHosts.slice(0, lastAtIdx);
  const hosts = authAndHosts.slice(lastAtIdx + 1);

  const firstColonIdx = userPass.indexOf(':');
  if (firstColonIdx === -1) return uri;

  const rawUser = userPass.slice(0, firstColonIdx);
  const rawPass = userPass.slice(firstColonIdx + 1);
  let cleanPass = rawPass;
  if (cleanPass.startsWith('<') && cleanPass.endsWith('>') && cleanPass.length > 2) {
    cleanPass = cleanPass.slice(1, -1);
  }

  try {
    const decodedUser = decodeURIComponent(rawUser);
    const decodedPass = decodeURIComponent(cleanPass);
    const encodedUser = encodeURIComponent(decodedUser);
    const encodedPass = encodeURIComponent(decodedPass);

    return `${protocol}${encodedUser}:${encodedPass}@${hosts}${pathAndQuery}`;
  } catch {
    return uri;
  }
};

export const runSafeDbDiagnostics = () => {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  const hasUri = Boolean(rawUri);
  const isSrv = rawUri.startsWith('mongodb+srv://');
  const isStandard = rawUri.startsWith('mongodb://');

  let hasDbName = false;
  let hasAuthSource = false;
  let hasReplicaSet = false;

  if (hasUri) {
    hasAuthSource = rawUri.includes('authSource=');
    hasReplicaSet = rawUri.includes('replicaSet=');
    const pathMatch = rawUri.match(/mongodb(?:\+srv)?:\/\/[^\/]+\/([^?]+)/);
    hasDbName = Boolean(pathMatch && pathMatch[1] && pathMatch[1].trim());
  }

  logger.info('[DB Diagnostics] Safe Config Audit:', {
    hasMongoUri: hasUri,
    protocol: isSrv ? 'mongodb+srv' : isStandard ? 'mongodb' : 'unknown/missing',
    hasDatabaseName: hasDbName,
    hasAuthSourceParam: hasAuthSource,
    hasReplicaSetParam: hasReplicaSet,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    runSafeDbDiagnostics();

    const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!rawUri) {
      throw new Error('MONGODB_URI (or MONGO_URI) is not defined in environment variables');
    }

    const sanitizedUri = sanitizeMongoUri(rawUri);

    const conn = await mongoose.connect(sanitizedUri);

    logger.info('MongoDB connected', { host: conn.connection.host });
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
    return null;
  }
};

export default connectDB;
