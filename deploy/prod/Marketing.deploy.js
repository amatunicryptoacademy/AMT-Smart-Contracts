module.exports = async ({ deployments: { deploy }, ethers: { getNamedSigners, getContract } }) => {
	const { deployer } = await getNamedSigners();
	await deploy("Marketing", {
		from: deployer.address,
		contract: "Marketing",
		args: ["0x970f855e0B383CF0b3224a16b856C0f2511ffc1e"],
		log: true
	});

	const marketing = await getContract("Marketing");

	return [marketing];
};

module.exports.tags = ["Marketing", "prod"];