import * as fs from "fs";
import * as path from "path";
import mime from "mime";
import * as dotenv from "dotenv";
import { NFTStorage, File } from "nft.storage";
import { products } from "../../src/backend/db/products";
import { Product } from "../interfaces/Product";

import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Client from "@web3-storage/w3up-client";
import * as Proof from "@web3-storage/w3up-client/proof";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";

dotenv.config();
const baseImageDir = path.resolve(__dirname, "../../public");

// NFT.STORAGE get secret key
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;

/* if(!NFT_STORAGE_KEY) throw new Error("NFT.STORAGE key missing")
const client = new NFTStorage({token: NFT_STORAGE_KEY})
console.log("✅ Client ready. Storage endpoint:", client.token); */

async function readImageAsFile(filePath: string): Promise<File> {
  const fullPath = path.join(baseImageDir, filePath);
  const content = await fs.promises.readFile(fullPath);
  const type = mime.getType(fullPath) || "application/octet-stream";
  if (!type) throw new Error("Image type cannot be detected");
  return new File([content], path.basename(fullPath), { type });
}

async function uploadImagesAndMetadata() {
  const uris: { name: string; tokenUri: string }[] = [];

  // Cast product in list of Product
  const listProducts = products as Product[];
  const test = listProducts[0];

  const imageFile = await readImageAsFile(test.img);

  // Load client with specific private key
  const principal = Signer.parse(process.env.KEY_STORACHA || "");
  const store = new StoreMemory();
  const client = await Client.create({ principal });

  // Add proof that this agent has been delegated capabilities on the space
  const proof = await Proof.parse(process.env.PROOF || "");
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  const fileCid = await client.uploadFile(imageFile)

  console.log(`cid : ${fileCid}`)

}

uploadImagesAndMetadata();
