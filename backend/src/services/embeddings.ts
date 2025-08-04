// services/embeddings.ts
import OpenAI from "openai";
import Product from "../models/Product";


const client = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    "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",
});

export async function getEmbedding(text: string): Promise<number[]> {
  const resp = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return resp.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

/**
 * Ensures the given product has an embedding. Idempotent.
 */
export async function ensureProductEmbedding(productId: string) {
  const product = await Product.findById(productId);
  if (!product) return; // not found

  if (
    product.embedding &&
    Array.isArray(product.embedding) &&
    product.embedding.length
  ) {
    return; // already present
  }

  const text = [
    product.name,
    product.description,
    Array.isArray(product.tags) ? product.tags.join(" ") : "",
  ]
    .filter(Boolean)
    .join(". ");

  try {
    const emb = await getEmbedding(text);
    product.embedding = emb;
    await product.save();
  } catch (err) {
    console.error("Failed to create embedding for product", productId, err);
    // swallow or rethrow depending on your tolerance
  }
}
