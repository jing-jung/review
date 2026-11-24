import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/goal_todo_app';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isFallback: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isFallback: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<{ isFallback: boolean }> {
  if (cached.conn) {
    return { isFallback: cached.isFallback };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // 2초 내에 Mongo 서버 연결 실패 시 바로 감지
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      cached.isFallback = false;
      return m;
    }).catch((err) => {
      console.warn('⚠️ MongoDB 연결 실패 (서버 미실행 등). 인메모리 스토어로 대체 동작합니다.', err.message);
      cached.isFallback = true;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.isFallback = true;
  }

  return { isFallback: cached.isFallback };
}
