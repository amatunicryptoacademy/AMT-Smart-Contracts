// module.exports = async ({
// 	deployments: { deploy },
// 	ethers: { getNamedSigners, getContract, getContractAt, utils, provider }
// }) => {
// 	const { deployer } = await getNamedSigners();
// 	const lottery = await getContract("LotteryMock");
// 	const router = await getContractAt("IApeRouter02", "0x10ED43C718714eb63d5aA57B78B54704E256024E");
// 	const link = await getContractAt("Amatik", "0x404460C6A5EdE2D891e8297795264fDe62ADBB75");
// 	// const factory = await getContractAt("IApeFactory", "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6");
// 	// await amatik.approve(router.address, parseEther("1000"));
// 	await router.swapExactETHForTokens(
// 		0,
// 		["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0x404460C6A5EdE2D891e8297795264fDe62ADBB75"],
// 		deployer.address,
// 		(await provider.getBlock()).timestamp + 1000,
// 		{ value: utils.parseEther("1") }
// 	);
// 	console.log("askdhbakj");

// 	await deploy("RandomNumberGenerator", {
// 		from: deployer.address,
// 		contract: "RandomNumberGenerator",
// 		args: [
// 			"0xc587d9053cd1118f25F645F9E08BB98c9712A4EE",
// 			"0x404460C6A5EdE2D891e8297795264fDe62ADBB75",
// 			lottery.address,
// 			"0x17cd473250a9a479dc7f234c64332ed4bc8af9e8ded7556aa6e66d83da49f470",
// 			utils.parseEther("0.5")
// 		],
// 		log: true
// 	});

// 	const randomNumberGenerator = await getContract("RandomNumberGenerator");
// 	// await link.transfer(randomNumberGenerator.address, utils.parseEther("0.5"));

// 	return randomNumberGenerator;
// };

// module.exports.tags = ["RandomNumberGenerator", "dev"];
// module.exports.dependencies = ["Lottery"];
