module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	await deploy("Staking", {
		from: deployer.address,
		contract: "Staking",
		args: ["0x970f855e0B383CF0b3224a16b856C0f2511ffc1e"],
		log: true
	});

	const staking = await getContract("Staking");

	return [staking];
};

module.exports.tags = ["Staking", "prod"];
