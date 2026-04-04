import express from 'express';
import payload from 'payload';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.get('/', (_, res) => {
  res.redirect('/admin');
});

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'uncover-cms-default-secret',
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin: ${payload.getAdminURL()}`);
    },
  });

  app.listen(PORT, '0.0.0.0', () => {
    payload.logger.info(`Server running on port ${PORT}`);
  });
};

start();
