import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const treasury = process.env.METASHIFT_TREASURY || deployer.address;

  const AdSlotNFT = await ethers.getContractFactory("AdSlotNFT");
  const adSlot = await AdSlotNFT.deploy(deployer.address);
  await adSlot.waitForDeployment();
  console.log("AdSlotNFT:", await adSlot.getAddress());

  const AdManager = await ethers.getContractFactory("MetaShiftAdManager");
  const manager = await AdManager.deploy(await adSlot.getAddress(), deployer.address, treasury);
  await manager.waitForDeployment();
  console.log("MetaShiftAdManager:", await manager.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



