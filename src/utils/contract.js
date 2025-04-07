import {ethers, JsonRpcProvider} from 'ethers'
import abi from "./NFTMarketPlace.json"
import addresses from "./deployed_addresses.json"

const CONTRACT_ADDRESS = addresses["LockModule#NFTMarketPlace"];

export const getReadContract = () => {
    const provider = new JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/bTOfaEEYDOiFt2DadMAlh59nmVrHwUUh`
    );
    return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, provider);
  };

export const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer)
    return contract.connect(signer);
}