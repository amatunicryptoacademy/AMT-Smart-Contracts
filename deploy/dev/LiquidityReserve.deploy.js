module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	await deploy("LiquidityReserve", {
		from: deployer.address,
		contract: "LiquidityReserve",
		args: [amatik.address],
		log: true
	});

	const liquidityReserve = await getContract("LiquidityReserve");

	return [liquidityReserve];
};

module.exports.tags = ["LiquidityReserve", "dev"];
module.exports.dependencies = ["Amatik"];
