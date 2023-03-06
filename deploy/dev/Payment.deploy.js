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
	const { deployer, owner } = await getNamedSigners();
	const burnReserve = await getContract("BurnReserve");
	const amatik = await getContract("Amatik");
	const liquidityReserve = await getContract("LiquidityReserve");
	const router = await getContractAt("IApeRouter02", "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7");
	const factory = await getContractAt("IApeFactory", "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6");
	await amatik.approve(router.address, parseEther("1000"));
	await router.addLiquidityETH(
		amatik.address,
		parseEther("1000"),
		0,
		0,
		deployer.address,
		(await provider.getBlock()).timestamp + 100,
		{ value: parseEther("1") }
	);
	const pair = await factory.getPair("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", amatik.address);
	await deploy("Payment", {
		from: deployer.address,
		contract: "Payment",
		args: [
			burnReserve.address,
			"0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
			pair,
			"0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
			amatik.address,
			50,
			owner.address, 
			liquidityReserve.address
		],
		log: true
	});

	const payment = await getContract("Payment");

	return [payment];
};

module.exports.tags = ["Payment", "dev"];
module.exports.dependencies = ["LiquidityReserve"];
