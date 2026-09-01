let appPromise = null;

async function getAppAndConnect() {
  if (!appPromise) {
    appPromise = (async () => {
      const [appModule, dbModule] = await Promise.all([
        import('../backend/app.js'),
        import('../backend/config/database.js'),
      ]);
      const app = appModule.default || appModule;
      const connectDB = dbModule.default || dbModule.connectDB || dbModule;
      return { app, connectDB };
    })();
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const { app, connectDB } = await getAppAndConnect();
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function execution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in serverless execution.',
    });
  }
}
