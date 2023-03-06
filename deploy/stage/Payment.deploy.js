module.exports = async ({
	deployments: { deploy },
	ethers: {
		getNamedSigners,
		getContract,
		getContractAt,
		utils: { parseEther },
		provider
	}
}) => {
	const { deployer } = await getNamedSigners();
	const burnReserve = await getContract("BurnReserve");
	const amatik = await getContract("Amatik");
	const liquidityReserve = await getContract("LiquidityReserve");
	// const router = await getContractAt("IApeRouter02", "0xD99D1c33F9fC3444f8101754aBC46c52416550D1");
	// const factory = await getContractAt("IApeFactory", "0x6725F303b657a9451d8BA641348b6761A6CC7a17 ");
	// await amatik.approve(router.address, parseEther("1000"));
	// await router.addLiquidityETH(
	// 	amatik.address,
	// 	parseEther("1000"),
	// 	0,
	// 	0,
	// 	deployer.address,
	// 	(await provider.getBlock()).timestamp + 100,
	// 	{ value: parseEther("0.5") }
	// );
	// const pair = await factory.getPair("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", amatik.address);
	try {
		await deploy("Payment", {
			from: deployer.address,
			contract: "Payment",
			args: [
				burnReserve.address,
				"0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
				"0x9172bC6f337558F15514181b88B9E5e99322FCDd",
				"0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
				amatik.address,
				50,
				deployer.address,
				liquidityReserve.address
			],
			log: true
		});
	} catch (error) {
		throw error.message;
	}
	const payment = await getContract("Payment");

	return [payment];
};

module.exports.tags = ["Payment", "stage"];
module.exports.dependencies = ["LiquidityReserve"];
// "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
// "0x569B73cc12a6893a57bB91e19dE6eF8ead7e61E7",
// "0x3380aE82e39E42Ca34EbEd69aF67fAa0683Bb5c1",
