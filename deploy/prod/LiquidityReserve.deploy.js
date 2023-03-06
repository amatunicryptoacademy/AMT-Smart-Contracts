module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	await deploy("LiquidityReserve", {
		from: deployer.address,
		contract: "LiquidityReserve",
		args: ["0x970f855e0B383CF0b3224a16b856C0f2511ffc1e"],
		log: true
	});

	const liquidityReserve = await getContract("LiquidityReserve");

	return [liquidityReserve];
};

module.exports.tags = ["LiquidityReserve", "prod"];
