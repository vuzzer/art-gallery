import { products } from "../../src/backend/db/products.js";
import * as fs from "fs";
import * as path from "path";
import mime from "mime";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import * as Client from "@web3-storage/w3up-client";
import * as Proof from "@web3-storage/w3up-client/proof";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory";
import pLimit from "p-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseImageDir = path.resolve(__dirname, "../../public");
const jsonUriDir = path.resolve(__dirname, "../../src/backend/db");

// Limit to 5 task parallel
const limit = pLimit(5);

async function createMetadataFile(product, imageCID) {
  const metadata = {
    name: product.name,
    description: product.description,
    image: `https://${imageCID}.ipfs.w3s.link`,
    attributes: [
      { trait_type: "Category", value: product.category_name },
    ],
  };

  const blob = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  });
  return new File([blob], `${product.name.replace(/\s/g, "_")}.json`, {
    type: "application/json",
  });
}

async function readImageAsFile(filePath) {
  const fullPath = path.join(baseImageDir, filePath);
  const content = await fs.promises.readFile(fullPath);

  const type = mime.getType(fullPath) || "application/octet-stream";

  if (!type) throw new Error("Image type cannot be detected");
  if (!fs.existsSync(fullPath)) throw new Error("File not found");

  return new File([content], path.basename(fullPath), { type });
}

async function processProduct(product, client) {
  try {
    const imageFile = await readImageAsFile(product.img);
    const imageCID = await client.uploadFile(imageFile);

    const metadataFile = await createMetadataFile(product, imageCID);
    const metadataCID = await client.uploadFile(metadataFile);

    const tokenURI = `https://${metadataCID}.ipfs.w3s.link`;
    console.log(`${product.name} uploaded → ${tokenURI}`);

    return { name: product.name, tokenURI, isStock: product.is_stock };

  } catch (err) {
    console.error(`Error with ${product.name}:`, err);
    return null;
  }
}

async function main() {
  // Load client with specific private key
  const principal = Signer.parse(process.env.KEY_STORACHA || "");
  const store = new StoreMemory();
  const client = await Client.create({ principal, store });

  // Add proof that this agent has been delegated capabilities on the space
  const proof = await Proof.parse(process.env.PROOF || "");
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  const tasks = products.map((product) =>
    limit(() => processProduct(product, client))
  );
  const results = await Promise.allSettled(tasks);

  const uris = results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);

  fs.writeFileSync(path.join(jsonUriDir, "uris.json"), JSON.stringify(uris, null, 2));
  fs.writeFileSync("uris.json", JSON.stringify(uris, null, 2));
  console.log("\nuris.json generate with success !");
}

main();
