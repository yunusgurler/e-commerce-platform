import dotenv from 'dotenv';
import connectDB from '../../src/config/db';
import Product from '../../src/models/Product';
import { ensureProductEmbedding } from '../services/embeddings';

dotenv.config();

(async () => {
  if (!process.env.MONGO_URI) throw new Error('Missing MONGO_URI');
  await connectDB(process.env.MONGO_URI!);

  const products = await Product.find().lean();
  for (const p of products) {
    await ensureProductEmbedding(p._id.toString());
    console.log('Embedding ensured for', p._id);
  }

  console.log('Done');
  process.exit(0);
})();
