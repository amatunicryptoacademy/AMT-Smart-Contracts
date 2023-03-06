module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	const liquidityReserve = await getContract("LiquidityReserve");
	const burnReserve = await getContract("BurnReserve");
	await deploy("Lottery", {
		from: deployer.address,
		contract: "Lottery",
		args: [
			amatik.address,
			"0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
			"0xe1F65657c63a9278b614314f480CB948358FAb1b",
			"0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
			burnReserve.address,
			liquidityReserve.address,
			deployer.address
		],
		log: true
	});

	const lottery = await getContract("Lottery");

	return lottery;
};

module.exports.tags = ["Lottery", "stage"];
module.exports.dependencies = ["LiquidityReserve", "BurnReserve"];
