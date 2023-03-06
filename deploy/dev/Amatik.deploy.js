module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const burnReserve = await getContract("BurnReserve");
	await deploy("Amatik", {
		from: deployer.address,
		contract: "Amatik",
		args: [deployer.address, burnReserve.address],
		log: true
	});

	const amatik = await getContract("Amatik");

	return [amatik];
};

module.exports.tags = ["Amatik", "dev"];
module.exports.dependencies = ["BurnReserve"];
