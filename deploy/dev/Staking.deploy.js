module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	const amatik = await getContract("Amatik");
	await deploy("Staking", {
		from: deployer.address,
		contract: "Staking",
		args: [amatik.address],
		log: true
	});

	const staking = await getContract("Staking");

	return [staking];
};

module.exports.tags = ["Staking", "dev"];
module.exports.dependencies = ["Amatik"];
