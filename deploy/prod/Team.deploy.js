module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	await deploy("Team", {
		from: deployer.address,
		contract: "Team",
		args: ["0x970f855e0B383CF0b3224a16b856C0f2511ffc1e"],
		log: true
	});

	const team = await getContract("Team");

	return [team];
};

module.exports.tags = ["Team", "prod"];